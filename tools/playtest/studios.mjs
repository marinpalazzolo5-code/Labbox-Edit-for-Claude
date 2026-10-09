// ============================================================================
// STUDIO TEST. Opens other/level-studio.html, other/entity-studio.html and
// other/entity-viewer.html in the fake browser, clicks through every preset in
// the two studios, and loads what they print back in: a level file has to
// register through LabLevels.add, an entity file has to evaluate against the
// game's own entity code.
//
//   node tools/playtest/studios.mjs
// ============================================================================
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { installBrowser, stubRenderer } from './dom.mjs';
import { installGlobals } from './globals.mjs';
import { runPage } from './page.mjs';

const PAGES = ['other/level-studio.html', 'other/entity-studio.html', 'other/entity-viewer.html'];

// Each page gets its own process: one fake DOM per page, like one browser tab.
if (!process.argv[2]) {
  let bad = 0;
  for (const page of PAGES) {
    const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), page], { stdio: 'inherit' });
    if (r.status !== 0) bad++;
  }
  console.log(`\n${PAGES.length - bad}/${PAGES.length} page(s) clean`);
  process.exit(bad ? 1 : 0);
}

installBrowser();
const clock = installGlobals();
const g = globalThis;

const noise = [];
console.error = (...a) => noise.push('console.error: ' + a.map(String).join(' '));
console.warn = (...a) => noise.push('console.warn: ' + a.map(String).join(' '));
clock.onError((kind, e) => noise.push(kind + ': ' + (e && e.stack || String(e)).split('\n').slice(0, 3).join(' | ')));

let failed = 0;

for (const file of [process.argv[2]]) {
  noise.length = 0;
  const page = runPage({ file, afterScript() { const T = g.__mod && g.__mod['vendor/three/build/three.module.js']; if (T) stubRenderer(T); } });
  g.document.readyState = 'complete';
  page.fire('DOMContentLoaded');
  clock.pump(20);

  const byId = g.__dom.byId;
  const $ = (id) => byId.get(id);
  const outputs = [];
  // the level studio picks presets from a <select>, the entity studio from a row of buttons
  const select = $('preset');
  const buttons = $('presets');
  const options = select ? select.children.filter((o) => o.value) : (buttons ? buttons.children.filter((b) => b.tagName === 'BUTTON') : []);

  for (const o of options) {
    if (select) { select.value = o.value; select.dispatchEvent({ type: 'change', target: select }); }
    else o.click();
    clock.pump(4);
    const out = $('file');
    outputs.push({ label: o.value || o.textContent, text: out ? out.textContent : '' });
  }
  if (/level-studio/.test(file)) for (const id of ['addcut', 'addstage', 'addent', 'addrare']) { const el = $(id); if (el) { el.click(); clock.pump(2); } }
  if (/studio/.test(file)) { const out = $('file'); outputs.push({ label: 'after edits', text: out ? out.textContent : '' }); }

  let broken = 0;
  const fail = (msg) => { console.log('  ' + msg); broken++; };
  if (/level-studio/.test(file)) {
    const r = mapEditorTest($, fail);
    if (r) outputs.push(r);
  }
  for (const o of outputs) {
    if (!o.text || !o.text.trim()) { console.log('  EMPTY output for ' + o.label); broken++; continue; }
    try {
      if (/level-studio/.test(file)) {
        const reg = { added: [], pack() {}, packExtra() {} , add(folder, def) { this.added.push(def); } };
        new Function('LabLevels', o.text)(reg);
        const def = reg.added[reg.added.length - 1];
        if (!def || !def.id || !def.gen || !def.stages) { console.log('  INCOMPLETE level from ' + o.label); broken++; }
      } else {
        new Function('__mod', 'window', 'document', o.text)(g.__mod, g, g.document);
      }
    } catch (e) { console.log('  BROKEN output from ' + o.label + ': ' + e.message); broken++; }
  }

  const errs = page.errors.length + page.missing.length + noise.length;
  console.log(`${errs || broken ? 'FAIL' : 'ok  '} ${file.padEnd(32)} ${options.length} preset(s), ${outputs.length} file(s) written, ${broken} broken`);
  for (const e of page.errors) console.log('      script ' + e.where + ': ' + (e.error && e.error.stack || '').split('\n').slice(0, 3).join(' | '));
  for (const m of page.missing) console.log('      missing file: ' + m);
  for (const n of [...new Set(noise)].slice(0, 8)) console.log('      ' + n.slice(0, 260));
  if (errs || broken) failed++;
}

process.exit(failed ? 1 : 0);

// ---------------------------------------------------------------------------- the map editor
// Paint a few cells, set the spawn and place / drag / remove a creature with real
// pointer events on the map canvas, then check what the studio writes: the file has
// to register through LabLevels.add with gen.params.layout, spawn and placed, and
// the "Play preview" payload has to carry the same text.
function mapEditorTest($, fail) {
  const S = g.LevelStudio;
  if (!S) { fail('the level studio has no window.LevelStudio'); return null; }
  const cv = $('mapcanvas');
  if (!cv) { fail('no map canvas (#mapcanvas)'); return null; }
  const gen = $('gentype');
  gen.value = 'lobby'; gen.dispatchEvent({ type: 'change', target: gen });
  const nav = g.document.querySelectorAll('.navbtn').find((b) => b.dataset.sec === 'map');
  if (nav) nav.click();
  const tool = (t) => { const b = g.document.querySelectorAll('[data-tool]').find((x) => x.dataset.tool === t); if (b) b.click(); else fail('no map tool "' + t + '"'); };
  // the studio maps a pointer to a cell through getBoundingClientRect (100 px wide in
  // the fake DOM) and the canvas' css width: invert that to aim at the middle of a cell
  const at = (cx, cz, extra = {}) => {
    const k = (parseFloat(cv.style.width) || 100) / 100, cp = S.map.cp, ruler = 30;
    return { clientX: (ruler + cx * cp + cp / 2) / k, clientY: (ruler + cz * cp + cp / 2) / k, button: 0, pointerId: 1, preventDefault() {}, ...extra };
  };
  const ptr = (type, cx, cz, extra) => cv.dispatchEvent({ type, target: cv, ...at(cx, cz, extra) });
  const drag = (from, to, extra) => { ptr('pointerdown', from[0], from[1], extra); ptr('pointermove', to[0], to[1], extra); ptr('pointerup', to[0], to[1], extra); clock.pump(1); };

  tool('wall'); drag([2, 2], [4, 2]);                 // a short wall, dragged
  tool('floor'); drag([6, 6], [6, 6]);                // one forced-open cell
  tool('spawn'); drag([8, 8], [8, 8]);                // spawn at the centre of cell (8, 8) = (17, 17) m
  let creature = null;
  const pal = $('palette');
  const first = pal && pal.children.find((c) => c.tagName === 'BUTTON');
  if (first) { first.click(); creature = S.map.ent; }
  if (!creature) { creature = 'smiler'; S.map.ent = creature; tool('entity'); console.log('  note: no creature palette (entity files not loaded) - placing "smiler" by id'); }
  drag([10, 10], [10, 10]);                           // drop it on cell (10, 10)
  tool('move'); drag([10, 10], [12, 10]);             // drag it two cells right
  tool('entity'); drag([14, 14], [14, 14]);           // a second one ...
  ptr('pointerdown', 14, 14, { button: 2 }); clock.pump(1);   // ... removed with a right-click
  S.paintCell(20, 20, '#', 3); S.update();           // and the API the console gets

  const text = $('file').textContent;
  const reg = { added: [], pack() {}, packExtra() {}, add(folder, def) { this.added.push({ folder, def }); } };
  try { new Function('LabLevels', text)(reg); } catch (e) { fail('map level does not evaluate: ' + e.message); return null; }
  const got = reg.added[0];
  if (!got) { fail('map level never calls LabLevels.add'); return null; }
  const { def } = got;
  const lay = def.gen && def.gen.params && def.gen.params.layout;
  if (!Array.isArray(lay) || !lay.length) fail('no gen.params.layout after painting');
  else {
    if (!lay.every((r) => typeof r === 'string' && r.length === lay[0].length && /^[#.?S]+$/.test(r))) fail('layout rows are not equal-length strings of #.?S');
    if (lay[2].slice(2, 5) !== '###') fail('the dragged wall is not in the layout (row 2 = ' + lay[2] + ')');
    if (lay[6][6] !== '.') fail('the open floor cell is not in the layout');
    if (lay[21].slice(19, 22) !== '###') fail('paintCell(20, 20, "#", 3) is not in the layout');
  }
  if (!def.spawn || def.spawn[0] !== 17 || def.spawn[1] !== 17) fail('spawn should be [17, 17], got ' + JSON.stringify(def.spawn));
  if (!Array.isArray(def.placed) || def.placed.length !== 1) fail('placed should hold one creature, got ' + JSON.stringify(def.placed));
  else if (def.placed[0][0] !== creature || def.placed[0][1] !== 25 || def.placed[0][2] !== 21) fail('placed creature should be ["' + creature + '", 25, 21], got ' + JSON.stringify(def.placed[0]));

  // the preview opens ../index.html#preview=<json>, and that json is exactly the downloadable file
  const opened = [];
  const oldOpen = g.open;
  g.open = (url) => { opened.push(url); return null; };
  const pv = $('preview');
  if (pv) pv.click(); else fail('no Play preview button (#preview)');
  g.open = oldOpen;
  let payload = null;
  const m = /^\.\.\/index\.html#preview=(.*)$/.exec(opened[0] || '');
  try { payload = m && JSON.parse(decodeURIComponent(m[1])); } catch (e) { /* checked below */ }
  if (!payload || payload.source !== text || payload.pack !== got.folder) fail('Play preview did not open ../index.html#preview={ pack, source } with the level file (opened: ' + String(opened[0]).slice(0, 80) + ')');

  // and it reads back in: import the file, write it again, same text
  try {
    S.importLevelText(text); clock.pump(1);
    if ($('file').textContent !== text) fail('importing the studio\'s own file and writing it again changed it');
  } catch (e) { fail('importing the file threw: ' + e.message); }
  console.log(`  map editor: ${lay ? lay[0].length + 'x' + lay.length : '-'} layout, spawn ${JSON.stringify(def.spawn)}, placed ${JSON.stringify(def.placed)}${S.entities && S.entities.ok ? ', ' + S.entities.ids.length + ' creatures loaded' : ', creature files not loaded'}`);
  return { label: 'map editor', text };
}
