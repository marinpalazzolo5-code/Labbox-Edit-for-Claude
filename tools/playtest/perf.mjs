// ============================================================================
// CHUNK COST PROFILE. Enters levels in the fake browser and times what the
// frame loop actually pays for: every chunk build (layout + geometry + light
// bake) while the player walks, and the per-frame update work in between.
//
//   node tools/playtest/perf.mjs              a few levels from every pack
//   node tools/playtest/perf.mjs pg02         one level
//   node tools/playtest/perf.mjs corruption   one pack
//
// Numbers are CPU milliseconds in Node (no GPU), so they are a relative guide:
// anything over ~8 ms for one step is a lag spike waiting to happen.
// ============================================================================
import { bootGame } from './boot.mjs';

// the harness fakes performance.now(); keep the real clock for timing
const realNow = performance.now.bind(performance);
const b = bootGame();
if (!b.game) { console.log('BOOT FAILED'); process.exit(1); }
const { game, clock, LEVELS } = b;
// the game budgets work against performance.now(): give it the real one so slicing is visible
globalThis.performance = { now: realNow };
const arg = process.argv[2] || 'sample';
let list;
if (arg === 'all') list = LEVELS;
else if (LEVELS.some((l) => (l.track || 'main') === arg)) list = LEVELS.filter((l) => (l.track || 'main') === arg);
else if (arg === 'sample') list = ['main', 'phobia', 'corruption', 'playground'].flatMap((t) => LEVELS.filter((l) => (l.track || 'main') === t).slice(0, 3));
else list = LEVELS.filter((l) => l.id === arg);

const now = realNow;
const rows = [];
for (const lv of list) {
  game.state = 'menu';
  game.enter(lv.id).catch(() => {});
  let n = 0;
  while (game.state === 'loading' && n++ < 6000) await clock.settle(1);
  game.state = 'play';
  b.input.locked = true;
  const w = game.world;
  const builds = [];
  const built0 = w.chunksBuilt;
  const orig = w.buildChunk.bind(w);
  w.buildChunk = (cx, cz) => { const t = now(); const r = orig(cx, cz); builds.push(now() - t); return r; };
  const origLayout = w.getLayout.bind(w);
  let layoutMs = 0;
  w.getLayout = (cx, cz) => { const had = w.layouts.has(w.key(cx, cz)); if (had) return origLayout(cx, cz); const t = now(); const r = origLayout(cx, cz); layoutMs += now() - t; return r; };
  const frames = [];
  const pl = game.player;
  const start = pl.pos.clone();
  for (let i = 0; i < 240; i++) {
    pl.pos.x = start.x + i * 0.35; pl.pos.z = start.z + i * 0.2;
    pl.pos.y = w.groundAt(pl.pos.x, pl.pos.z);
    const t = now();
    await clock.settle(1);
    frames.push(now() - t);
  }
  w.buildChunk = orig; w.getLayout = origLayout;
  builds.sort((a, c) => a - c);
  frames.sort((a, c) => a - c);
  const q = (a, p) => a.length ? a[Math.min(a.length - 1, Math.floor(a.length * p))] : 0;
  rows.push({ id: lv.id, chunks: w.chunksBuilt - built0, buildMax: q(builds, 1), buildMed: q(builds, 0.5), layoutMs, frameMed: q(frames, 0.5), frameP99: q(frames, 0.99), frameMax: q(frames, 1) });
}
console.log('level'.padEnd(26) + 'chunks  build med/max ms   layout ms  frame med/p99/max ms');
for (const r of rows) {
  console.log(r.id.padEnd(26) + String(r.chunks).padStart(6) + `  ${r.buildMed.toFixed(1).padStart(6)} / ${r.buildMax.toFixed(1).padEnd(7)}  ${r.layoutMs.toFixed(1).padStart(9)}  ${r.frameMed.toFixed(1).padStart(6)} / ${r.frameP99.toFixed(1)} / ${r.frameMax.toFixed(1)}`);
}
