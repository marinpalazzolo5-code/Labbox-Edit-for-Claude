// Check the whole levels/ tree: files listed in packs, ids, generator settings,
// materials, props, goals, stages, spawns, who is in the level, the painted map and
// the shape of every cut. The list of names that count as valid (materials, props,
// goals, items, stage keys, cut fields, generator modes) is read out of
// other/level-studio.html, so the studio and this checker can never drift apart. The
// creature ids - and the pack each one belongs to - are read out of entities/loader.js
// and the files it loads, the same list the game and the studio use.
//
//   node tools/levelcheck/check.mjs            every pack
//   node tools/levelcheck/check.mjs corrupt    one pack
import fs from 'node:fs';
import path from 'node:path';
import { readLevel, listLevels, ORDER } from './levelio.mjs';
import { cutSurvey } from './cuts.mjs';
import { ROOT } from './bundle.mjs';

// ------------------------------------------------------------------ the studio's data
const studioFile = path.join(ROOT, 'other/level-studio.html');
const studio = fs.readFileSync(studioFile, 'utf8');
const dataStart = studio.indexOf('const GAME = ') + 'const GAME = '.length;
const GAME = JSON.parse(studio.slice(dataStart, studio.indexOf(';\n', dataStart)));

// ------------------------------------------------------------------ the creatures
// The ids the game really registers, and the folder (pack) each one comes from. Read
// the way the browser reads them: run entities/loader.js against a document.write
// that records the file list, then find what every listed file registers
// (BUILDERS.<id> / ENTITY_DEFS.<id> / D.<id> / variant('<id>', ...)). The folder of
// the first file that registers an id is its pack - what LabEntities.packOf says at
// runtime.
function entityRegistry() {
  const dir = path.join(ROOT, 'entities');
  const files = [];
  const prefix = 'file://' + dir + '/';
  const document = {
    currentScript: { src: prefix + 'loader.js' },
    write(html) {
      for (const m of String(html).matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)) files.push(m[1].startsWith(prefix) ? m[1].slice(prefix.length) : m[1]);
    },
  };
  new Function('window', 'document', fs.readFileSync(path.join(dir, 'loader.js'), 'utf8'))({}, document);
  const packOf = {}, fileOf = {}, problems = [], warnings = [];
  const listed = new Set(files);
  for (const f of files) {
    const full = path.join(dir, f);
    if (!fs.existsSync(full)) { problems.push('entities/loader.js lists ' + f + ' but entities/' + f + ' does not exist'); continue; }
    const folder = f.includes('/') ? f.split('/')[0] : 'base';
    if (folder === 'core') continue;
    const src = fs.readFileSync(full, 'utf8');
    const ids = new Set();
    for (const m of src.matchAll(/\bvariant\(\s*'([^']+)'/g)) ids.add(m[1]);
    for (const m of src.matchAll(/\b(?:BUILDERS|ENTITY_DEFS|D)\s*(?:\.([A-Za-z_$][\w$]*)|\[\s*'([^']+)'\s*\])\s*=(?!=)/g)) ids.add(m[1] || m[2]);
    if (!ids.size) warnings.push('entities/' + f + ' does not seem to register a creature');
    for (const id of ids) if (!packOf[id]) { packOf[id] = folder; fileOf[id] = f; }
  }
  // a creature file nobody loads is invisible to the game
  const walk = (d, rel) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const r = rel ? rel + '/' + e.name : e.name;
      if (e.isDirectory()) { if (e.name !== 'core') walk(path.join(d, e.name), r); continue; }
      if (e.name.endsWith('.js') && r !== 'loader.js' && !listed.has(r)) warnings.push('entities/' + r + ' is not listed in entities/loader.js, so nothing loads it');
    }
  };
  walk(dir, '');
  return { packOf, fileOf, problems, warnings };
}
const ENTITIES = entityRegistry();
/** The entity folder of a level pack: the campaign ('main') uses base/, any other pack its own id. */
const entityFolderOf = (pack) => (!pack || pack.id === 'main' ? 'base' : pack.id);

const SETS = {
  mat: new Set(GAME.mats),
  prop: new Set(GAME.props),
  goal: new Set(GAME.goals),
  entity: new Set(Object.keys(ENTITIES.packOf)),
  item: new Set(GAME.items),
  cls: new Set(GAME.classes),
  param: new Set([].concat(GAME.params || [], GAME.stageKeys || [],
    Object.keys(GAME.paramDocs), Object.keys(GAME.defaults.lobby))),
};
const STAGE_KEYS = new Set(['text', 'goal', 'item', 'count', 'dist', 'final', 'from', 'reuse', 'effects',
  'survive', 'rideTime', 'pickSafe', 'order', 'code', 'corridor', 'hint', 'clue', 'clueDist', 'clueTitle',
  'choose', 'chooseClue', 'revert', 'angle', 'start', 'flights', 'rise', 'floor', 'checkpoint', 'endings', 'next']);
const MAT_KEYS = ['wallMat', 'floorMat', 'ceilMat', 'fixtureMat', 'frameMat', 'waterMat'];
const OPEN_MODES = new Set(GAME.presets.map((p) => p.gen.mode).filter(Boolean).concat(GAME.openModes || [])
  .concat(['suburbs', 'city', 'field', 'cave', 'hills', 'courtyard', 'heights', 'lot', 'ocean', 'mall', 'apartment', 'stairwell']));
const ENDINGS = new Set(GAME.endings || ['jaws', 'grinder', 'whirlpool', 'drop']);
const TRANSPORTS = new Set(GAME.transports || ['elevator', 'stairs', 'stairshaft', 'slide', 'escalator']);
const STOREYS = new Set(['mall', 'apartment']);
const LEVEL_FIELDS = new Set(ORDER.concat(GAME.levelFields || ['placed']));
const LAYOUT_RE = new RegExp('^[' + (GAME.layoutChars || '#.?S').replace(/[\]\\^-]/g, '\\$&') + ']+$');

// ------------------------------------------------------------------ the packs
function loadPacks() {
  const src = fs.readFileSync(path.join(ROOT, 'levels/packs.js'), 'utf8');
  const packs = [];
  const LabLevels = { pack: (p) => packs.push(p), add() {}, packExtra() {} };
  new Function('LabLevels', 'window', 'document', 'console', src)(LabLevels, {}, {}, console);
  return packs;
}

const problems = [].concat(ENTITIES.problems);
const warnings = [].concat(ENTITIES.warnings);
const seenIds = new Map();
const only = process.argv[2];
const allPacks = loadPacks();
const packs = allPacks.filter((p) => !only || p.folder === only || p.id === only);

if (!packs.length) { console.error('no pack matches "' + only + '"'); process.exit(2); }

// every level id in the tree, for stage.next (it may point into another pack)
const allLevelIds = new Set();
for (const pack of allPacks) {
  const dir = path.join(ROOT, 'levels', pack.folder);
  for (const f of pack.files || []) {
    if (f === '_pack.js' || !fs.existsSync(path.join(dir, f))) continue;
    try { allLevelIds.add(readLevel(path.join(dir, f)).def.id); } catch (e) { /* reported below */ }
  }
}

let levelCount = 0;
for (const pack of packs) {
  const dir = path.join(ROOT, 'levels', pack.folder);
  if (!fs.existsSync(dir)) { problems.push('pack ' + pack.id + ': no folder levels/' + pack.folder); continue; }
  if (!pack.name) warnings.push('pack ' + pack.id + ': has no name');
  if (!pack.blurb) warnings.push('pack ' + pack.id + ': has no blurb for the pack dock');
  const myEntities = entityFolderOf(pack);

  const onDisk = listLevels(dir).concat(fs.existsSync(path.join(dir, '_pack.js')) ? ['_pack.js'] : []);
  for (const f of pack.files || []) {
    if (!fs.existsSync(path.join(dir, f))) { problems.push('pack ' + pack.id + ': lists ' + f + ' but levels/' + pack.folder + '/' + f + ' does not exist'); continue; }
    if (f === '_pack.js') continue;
    let def;
    try { def = readLevel(path.join(dir, f)).def; } catch (e) { problems.push(pack.folder + '/' + f + ': does not load: ' + e.message); continue; }
    levelCount++;
    const where = pack.folder + '/' + f;
    const id = def.id;

    // --- identity
    if (!id || !/^[a-z0-9][a-z0-9_-]*$/.test(id)) problems.push(where + ': bad id ' + JSON.stringify(id));
    if (seenIds.has(id)) problems.push(where + ': id "' + id + '" is already used by ' + seenIds.get(id));
    else seenIds.set(id, where);
    for (const k of ['name', 'description', 'intro']) if (!def[k]) warnings.push(where + ': no ' + k);
    if (typeof def.seed !== 'number') problems.push(where + ': seed must be a number');
    if (!Array.isArray(def.spawn) || def.spawn.length !== 2 || !def.spawn.every((n) => typeof n === 'number')) problems.push(where + ': spawn must be [x, z]');
    for (const k of Object.keys(def)) if (!LEVEL_FIELDS.has(k)) problems.push(where + ': unknown field "' + k + '"');

    // --- generator
    const gen = def.gen || {};
    const params = gen.params || {};
    if (!['lobby', 'forest', 'open'].includes(gen.type)) problems.push(where + ': unknown generator type "' + gen.type + '"');
    if (gen.type === 'open' && !OPEN_MODES.has(gen.mode)) problems.push(where + ': unknown open mode "' + gen.mode + '"');
    if (gen.type !== 'open' && gen.mode) warnings.push(where + ': mode is only used by the open generator');
    for (const [k, v] of Object.entries(params)) {
      if (!SETS.param.has(k)) problems.push(where + ': generator setting "' + k + '" does not exist');
      if (k === 'props' && v && !SETS.prop.has(v)) problems.push(where + ': no furniture set called "' + v + '"');
      if (MAT_KEYS.includes(k) && v && !SETS.mat.has(v)) problems.push(where + ': no material called "' + v + '"');
      if (k === 'wallMat' && Array.isArray(v) && v.length > 2 && v.length % 2 === 1) problems.push(where + ': wallMat runs need pairs of cells');
    }
    if (gen.type === 'lobby') {
      for (const k of ['height', 'density', 'wallMat', 'floorMat']) if (params[k] === undefined) warnings.push(where + ': lobby levels usually set ' + k);
      if (params.density && !Array.isArray(params.density)) problems.push(where + ': density is a [min, max] pair');
      if (params.cuts !== undefined && !Array.isArray(params.cuts)) problems.push(where + ': cuts must be an array');
    }
    if (params.ceilingWalk !== undefined && typeof params.ceilingWalk !== 'boolean') problems.push(where + ': ceilingWalk is true or false');
    if (params.ceilingWalk && gen.type !== 'lobby') warnings.push(where + ': ceilingWalk is only built by the lobby generator');
    // the multi-storey and stairwell places
    if (gen.type === 'open' && STOREYS.has(gen.mode)) {
      if (params.floors !== undefined && !(Number.isInteger(params.floors) && params.floors >= 3 && params.floors <= 6)) problems.push(where + ': floors is a whole number from 3 to 6');
      for (const k of ['fountain', 'atrium']) if (params[k] !== undefined && typeof params[k] !== 'boolean') problems.push(where + ': ' + k + ' is true or false');
    }
    if (gen.type === 'open' && gen.mode === 'stairwell') {
      if (params.flights !== undefined && !(Number.isInteger(params.flights) && params.flights >= 1)) problems.push(where + ': flights is a whole number of flights');
      else if (params.flights !== undefined && (params.flights < 12 || params.flights > 40)) warnings.push(where + ': ' + params.flights + ' flights is outside the usual 12-40');
      if (params.rise !== undefined && !(typeof params.rise === 'number' && params.rise > 0)) problems.push(where + ': rise is metres per flight, above 0');
      if (params.exits !== undefined && !(Number.isInteger(params.exits) && params.exits >= 0)) problems.push(where + ': exits is a whole number of landing doors');
    }
    for (const k of ['floors', 'fountain', 'atrium']) if (params[k] !== undefined && !(gen.type === 'open' && STOREYS.has(gen.mode))) warnings.push(where + ': ' + k + ' is only used by the mall and apartment modes');
    for (const k of ['flights', 'exits']) if (params[k] !== undefined && !(gen.type === 'open' && gen.mode === 'stairwell')) warnings.push(where + ': ' + k + ' is only used by the stairwell mode');
    // the painted map
    let layout = null;
    if (params.layout !== undefined) {
      const L = params.layout;
      if (!Array.isArray(L) || !L.length || !L.every((r) => typeof r === 'string')) problems.push(where + ': layout is an array of strings, one per row');
      else if (!L.every((r) => r.length === L[0].length && r.length > 0)) problems.push(where + ': every layout row must be the same length (' + L.map((r) => r.length).join(',') + ')');
      else if (!L.every((r) => LAYOUT_RE.test(r))) problems.push(where + ': layout rows may only use the characters ' + (GAME.layoutChars || '#.?S'));
      else layout = L;
      if (gen.type !== 'lobby') warnings.push(where + ': only the lobby generator follows layout; ' + (gen.mode || gen.type) + ' ignores it');
    }
    const cellOf = (x, z) => (layout ? (layout[Math.floor(z / 2)] || '')[Math.floor(x / 2)] : undefined);
    if (layout && Array.isArray(def.spawn) && cellOf(def.spawn[0], def.spawn[1]) === '#') problems.push(where + ': the spawn is inside a painted wall');
    if (params.cuts) {
      for (const c of params.cuts) {
        if (!c || typeof c !== 'object') { problems.push(where + ': a cut is not an object'); continue; }
        const kind = c.kind || 'rift';
        if (!['canyon', 'crevice', 'block', 'rift'].includes(kind)) problems.push(where + ': unknown cut kind "' + kind + '"');
        for (const [k, v] of Object.entries(c)) {
          if (k === 'kind') continue;
          if (k === 'axis') { if (!['x', 'z'].includes(v)) problems.push(where + ': a cut axis is "x" or "z"'); continue; }
          if (typeof v !== 'number') problems.push(where + ': cut field ' + k + ' should be a number');
        }
        if (kind === 'block' && !(c.w > 0 && c.h > 0)) problems.push(where + ': a block cut needs w and h');
        if (kind !== 'block' && !(c.length > 0)) problems.push(where + ': a ' + kind + ' cut needs a length');
      }
      if (!def.fall) warnings.push(where + ': has cuts but not fall: true, so falling in is survivable');
    }

    // --- stages
    if (!Array.isArray(def.stages) || !def.stages.length) problems.push(where + ': no stages');
    else {
      def.stages.forEach((s, i) => {
        const at = where + ' stage ' + (i + 1);
        for (const k of Object.keys(s)) if (!STAGE_KEYS.has(k)) problems.push(at + ': unknown key "' + k + '"');
        if (!s.text) warnings.push(at + ': no text');
        if (s.goal && !SETS.goal.has(s.goal)) problems.push(at + ': no goal called "' + s.goal + '"');
        if (!s.goal && !s.item && !s.survive && !s.reuse && !s.from) warnings.push(at + ': neither a goal nor an item, and it does not reuse the last one');
        if (s.item && !SETS.item.has(s.item)) problems.push(at + ': no item called "' + s.item + '"');
        if (s.dist && (!Array.isArray(s.dist) || s.dist.length !== 2 || s.dist[0] > s.dist[1])) problems.push(at + ': dist should be [min, max]');
        if (s.goal === 'stairshaft' && !(s.flights > 0)) warnings.push(at + ': a stairshaft stage needs flights (and usually rise)');
        if (s.floor !== undefined) {
          if (!Number.isInteger(s.floor) || s.floor < 0) problems.push(at + ': floor is a storey number, 0 = ground');
          else if (!(gen.type === 'open' && STOREYS.has(gen.mode))) warnings.push(at + ': floor is only used in mall and apartment levels');
          else if (s.floor >= (params.floors || 3)) problems.push(at + ': floor ' + s.floor + ' does not exist (the building has ' + (params.floors || 3) + ' floors, 0-' + ((params.floors || 3) - 1) + ')');
        }
        if (s.checkpoint !== undefined) {
          if (typeof s.checkpoint !== 'boolean') problems.push(at + ': checkpoint is true or false');
          else if (!TRANSPORTS.has(s.goal)) warnings.push(at + ': checkpoint only matters for ' + [...TRANSPORTS].join(' / ') + ' stages');
        }
        if (s.endings !== undefined) {
          if (!Array.isArray(s.endings) || !s.endings.length) problems.push(at + ': endings is a list such as [\'jaws\', \'drop\']');
          else for (const e of s.endings) if (!ENDINGS.has(e)) problems.push(at + ': no slide ending called "' + e + '" (' + [...ENDINGS].join(', ') + ')');
          if (s.goal !== 'slide') warnings.push(at + ': endings are only used by slide stages');
        }
        if (s.next !== undefined) {
          if (typeof s.next !== 'string' || !s.next) problems.push(at + ': next is a level id');
          else if (!allLevelIds.has(s.next)) problems.push(at + ': next points at "' + s.next + '", but no level has that id');
          if (!s.final) warnings.push(at + ': next only takes effect on the final stage');
          if (!TRANSPORTS.has(s.goal)) warnings.push(at + ': next needs a transport (' + [...TRANSPORTS].join(' / ') + ') to carry the player');
        }
        for (const fx of Array.isArray(s.effects) ? s.effects : []) {
          if (Array.isArray(fx) && fx[0] === 'spawn') useEntity(fx[1], 'a spawn effect in stage ' + (i + 1));
        }
      });
      if (!def.stages[def.stages.length - 1].final) problems.push(where + ': the last stage is not final, so the level cannot be finished');
      if (def.stages.filter((s) => s.final).length > 1) problems.push(where + ': more than one final stage');
    }

    // --- who is in it, and the loot
    function useEntity(eid, what) {
      if (!SETS.entity.has(eid)) { problems.push(where + ': no entity called "' + eid + '" in ' + what + ' (nothing in entities/loader.js registers it)'); return; }
      const p = ENTITIES.packOf[eid];
      if (p !== 'base' && p !== myEntities) {
        problems.push(where + ': ' + what + ' uses "' + eid + '" from entities/' + p + '/, which only ' + p + ' levels may use (move entities/' + ENTITIES.fileOf[eid] + ' to entities/base/ to share it)');
      }
    }
    for (const [list, what] of [[def.entities, 'entities'], [def.rare, 'rare']]) {
      if (list === undefined) continue;
      if (!Array.isArray(list)) { problems.push(where + ': ' + what + ' must be an array of [id, n]'); continue; }
      for (const e of list) {
        if (!Array.isArray(e) || !e.length) { problems.push(where + ': ' + what + ' entry ' + JSON.stringify(e) + ' should be ["id", n]'); continue; }
        useEntity(e[0], what);
        if (typeof e[1] !== 'number' || e[1] <= 0) problems.push(where + ': ' + what + ' entry for ' + e[0] + ' needs a positive number (how many / how likely)');
        if (e.length > 2 && (typeof e[2] !== 'object' || Array.isArray(e[2]))) problems.push(where + ': the third value of an entities entry (' + e[0] + ') is an options object');
        if (e.length > 3) warnings.push(where + ': ' + what + ' entry for ' + e[0] + ' has more values than [id, n, options]');
        if (what === 'rare' && e[1] > 1) warnings.push(where + ': rare chance for ' + e[0] + ' is above 1');
      }
    }
    if (def.placed !== undefined) {
      if (!Array.isArray(def.placed)) problems.push(where + ': placed must be an array of [id, x, z]');
      else for (const e of def.placed) {
        if (!Array.isArray(e) || e.length !== 3 || typeof e[0] !== 'string' || typeof e[1] !== 'number' || typeof e[2] !== 'number' || !isFinite(e[1]) || !isFinite(e[2])) {
          problems.push(where + ': placed entry ' + JSON.stringify(e) + ' should be ["id", x, z] in metres'); continue;
        }
        useEntity(e[0], 'placed');
        if (cellOf(e[1], e[2]) === '#') warnings.push(where + ': placed ' + e[0] + ' at (' + e[1] + ', ' + e[2] + ') is inside a painted wall');
      }
    }
    if (def.loot) for (const [k, v] of Object.entries(def.loot)) {
      if (!['keys', 'water', 'batteries', 'region'].includes(k)) problems.push(where + ': unknown loot kind "' + k + '"');
      const ok = typeof v === 'number' ? v >= 0 : (k === 'region' && Array.isArray(v) && v.length === 4 && v.every((n) => typeof n === 'number'));
      if (!ok) problems.push(where + ': loot ' + k + ' should be a number' + (k === 'region' ? ' or [x, z, w, h]' : ''));
    }
    if (def.cls && !SETS.cls.has(def.cls)) warnings.push(where + ': class "' + def.cls + '" is not one the game shows');

    // --- the shape of the holes
    const survey = cutSurvey(def);
    if (survey) {
      if (survey.spawnCut) problems.push(where + ': a cut covers the spawn point');
      if (survey.voidPct > 35) warnings.push(where + ': ' + survey.voidPct.toFixed(0) + '% of the area around the spawn is void');
      if (survey.cuts.some((c) => (c.kind || 'rift') === 'canyon') && survey.cuts.some((c) => (c.kind || 'rift') === 'canyon' && !c.bridges)) {
        problems.push(where + ': a canyon with no bridges cannot be crossed');
      }
    }
  }
  for (const f of onDisk) {
    if (f === '_pack.js') continue;
    if (!(pack.files || []).includes(f)) warnings.push('levels/' + pack.folder + '/' + f + ' is not listed in packs.js, so the game never loads it');
  }
}

for (const w of warnings) console.log('warning: ' + w);
for (const p of problems) console.log('PROBLEM: ' + p);
const byPack = {};
for (const p of Object.values(ENTITIES.packOf)) byPack[p] = (byPack[p] || 0) + 1;
console.log('\n' + Object.keys(ENTITIES.packOf).length + ' creature(s): ' + Object.entries(byPack).map(([k, v]) => k + ' ' + v).join(', '));
console.log(levelCount + ' level(s) in ' + packs.length + ' pack(s): ' + problems.length + ' problem(s), ' + warnings.length + ' warning(s)');
process.exitCode = problems.length ? 1 : 0;
