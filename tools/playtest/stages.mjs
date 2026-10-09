// ============================================================================
// STAGED LEVELS TEST. The pieces that turn a level into a sequence of stages:
//
//   * stairwell levels (pg05, pg16, pg27): the level starts inside the shaft at
//     its foot; a door on a landing is a way out (stage key exits); something
//     follows the player up and catches them if they stand still;
//   * checkpoints: passing a landing with a door (or every fourth landing) sets
//     one, and dying sends the player back to it, not to the foot of the stairs;
//   * transports between levels: a final stage with `next` carries the player
//     straight into that level;
//   * walking on the ceiling (gen.params.ceilingWalk, cor01): the rubble by the
//     spawn climbs through the hole, the top of the ceiling holds the player, and
//     the roof hatch up there is a shortcut out of the level;
//   * a painted map (gen.params.layout, from the level studio) makes the walls it
//     shows, and placed creatures stand where they were put.
//
//   node tools/playtest/stages.mjs
// ============================================================================
import { bootGame } from './boot.mjs';

const b = bootGame();
if (!b.game) { console.log('BOOT FAILED'); process.exit(1); }
const { game, clock, LEVELS, input, problems } = b;
let bad = 0;
const check = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${msg}`); if (!ok) bad++; };

async function enter(id) {
  game.state = 'menu';
  game.enter(id).catch((e) => problems.push({ kind: 'enter', msg: String(e) }));
  let n = 0;
  while (game.state === 'loading' && n++ < 6000) await clock.settle(1);
  game.state = 'play';
  input.locked = true;
}

// ---- pg27: inside the shaft, a door on a landing, a follower, checkpoints
await enter('pg27');
const pl = game.player, obj = game.objectives;
const shaft = obj.goals.find((g) => g.type === 'stairshaft');
check(!!shaft, 'pg27 builds its stair shaft');
check(shaft && Math.abs(pl.pos.x - shaft.x) < 1.1 && Math.abs(pl.pos.z - shaft.z) < 3.9, `pg27 starts inside the shaft (player ${pl.pos.x.toFixed(1)}, ${pl.pos.z.toFixed(1)}; shaft ${shaft && shaft.x.toFixed(1)}, ${shaft && shaft.z.toFixed(1)})`);
check(shaft && shaft.exits && shaft.exits.length === 2, 'pg27 has two landing doors');
const follower = game.entities.list.find((e) => e.follow);
check(!!follower, 'pg27 has a follower on the stairs');

// stand still at the bottom: the follower closes in
const h0 = pl.health;
for (let i = 0; i < 60 * 20 && pl.health >= h0; i++) await clock.settle(1);
check(pl.health < h0 || game.state === 'dead', `standing still lets the follower catch up (health ${h0.toFixed(0)} -> ${pl.health.toFixed(0)})`);
if (game.state === 'dead') { game.respawn(); await clock.settle(2); }

// climb to the first door's landing: that is a checkpoint
if (shaft && shaft.exits.length) {
  const ex = shaft.exits[0], p = shaft.exitFocus(0);
  pl.pos.set(p.x, shaft.y + ex.y, p.z); pl.vel.set(0, 0, 0);
  for (let i = 0; i < 20; i++) await clock.settle(1);
  const cp = game.checkpoint;
  check(cp && Math.abs(cp.y - (shaft.y + ex.y)) < 0.3, `reaching the floor ${ex.floor} landing sets a checkpoint (${cp ? 'y=' + cp.y.toFixed(2) : 'none'})`);
  // die, and come back on the landing
  pl.health = 0; pl.dead = true; game.die(null, 'test');
  for (let i = 0; i < 60 * 5 && game.state === 'dead'; i++) await clock.settle(1);
  check(Math.abs(pl.pos.y - (shaft.y + ex.y)) < 0.4, `after dying the player is back on the landing (y=${pl.pos.y.toFixed(2)})`);
  // the landing door finishes the level
  pl.pos.set(p.x, shaft.y + ex.y, p.z);
  await clock.settle(4);
  const cands = [];
  obj.candidates(pl.pos.x, pl.pos.z, cands);
  const door = cands.find((c) => /Leave the stairwell at floor/.test(c.text));
  check(!!door, `the landing door can be used (${door ? door.text : cands.map((c) => c.text).join(' / ') || 'no prompt'})`);
  if (door) {
    door.use();
    for (let i = 0; i < 200 && !obj.finished; i++) await clock.settle(1);
    check(obj.finished, 'leaving at the landing door completes the level');
  }
}

// ---- transports between levels: a final stage with `next`
const from = LEVELS.find((l) => l.stages.some((s) => s.final && s.next));
if (from) {
  await enter(from.id);
  const st = game.objectives.stages.find((s) => s.def.final && s.def.next);
  game.objectives.index = game.objectives.stages.indexOf(st);
  game.objectives.finishStage();
  for (let i = 0; i < 60 * 4 && game.level.id === from.id; i++) await clock.settle(1);
  let n = 0;
  while (game.state === 'loading' && n++ < 6000) await clock.settle(1);
  check(game.level.id === st.def.next, `${from.id} carries the player on to ${st.def.next} (now in ${game.level.id})`);
} else console.log('     (no level has a stage with next)');

// ---- cor01: climb the rubble onto the ceiling and leave by the roof hatch
const cw = LEVELS.find((l) => l.gen && l.id === 'cor01');
if (cw) {
  await enter('cor01');
  const w = game.world, H = w.gen.params.height, S = w.S;
  const sp = cw.spawn || [16, 16];
  const gx = Math.floor(sp[0] / S) + 2, gz = Math.floor(sp[1] / S) - 3;
  const z = (gz + 0.5) * S;
  pl.pos.set(gx * S - 0.6, 0, z); pl.vel.set(0, 0, 0);
  for (let i = 0; i < 60 * 6 && pl.pos.x < (gx + 3) * S + 1.5; i++) { pl.pos.x += 0.03; await clock.settle(1); }
  check(pl.pos.y > H - 0.1, `cor01: climbing the rubble puts the player on the ceiling (y=${pl.pos.y.toFixed(2)}, ceiling ${H})`);
  for (let i = 0; i < 60; i++) { pl.pos.x += 0.03; await clock.settle(1); }
  check(pl.pos.y > H - 0.1, `cor01: the top of the ceiling holds the player (y=${pl.pos.y.toFixed(2)})`);
  const sc = game.objectives.shortcut;
  check(!!sc, 'cor01: there is a roof hatch on top of the ceiling');
  if (sc) {
    pl.pos.set(sc.x + 0.8, sc.y, sc.z); pl.vel.set(0, 0, 0);
    await clock.settle(10);
    check(pl.pos.y > H - 0.1, `cor01: the hatch stands on the ceiling (player y=${pl.pos.y.toFixed(2)})`);
    const cands = [];
    game.objectives.candidates(pl.pos.x, pl.pos.z, cands);
    const hatch = cands.find((c) => /roof hatch/.test(c.text));
    check(!!hatch, 'cor01: the roof hatch can be used');
    if (hatch) { hatch.use(); for (let i = 0; i < 200 && !game.objectives.finished; i++) await clock.settle(1); }
    check(game.objectives.finished, 'cor01: the roof hatch is a way out of the level');
  }
}

// ---- a painted map and placed creatures
{
  const L = globalThis.__mod['src/levels/index.js'];
  const base = LEVELS.find((l) => l.id === 'level0');
  const rows = [];
  for (let z = 0; z < 16; z++) {
    let r = '';
    for (let x = 0; x < 16; x++) r += (x === 4 && z >= 2 && z <= 12) ? '#' : (z === 7 ? '.' : (x >= 6 && x <= 10 && z >= 6 && z <= 10 ? '.' : '?'));
    rows.push(r);
  }
  const lv = { ...base, id: 'layout-test', gen: L.compileGen({ type: 'lobby', params: { ...(base.gen().params), layout: rows } }, 'layout-test'),
    placed: [['smiler', 17, 17]], entities: [], rare: [] };
  LEVELS.push(lv);
  await enter('layout-test');
  const w = game.world;
  let walls = 0, wrong = 0;
  for (let z = 2; z <= 12; z++) {
    // the solid column x = 4: walls on its west and east faces (x lines 4 and 5)
    if (w.getEdgeV(4, z) === 1 && w.getEdgeV(5, z) === 1) walls++; else wrong++;
  }
  check(wrong === 0, `a painted wall column is walled in on both sides (${walls} cells right, ${wrong} wrong)`);
  let open = 0;
  for (let x = 6; x < 10; x++) if (w.getEdgeV(x + 1, 8) !== 1) open++;
  check(open === 4, `painted open floor is open (${open}/4 edges open)`);
  const sm = game.entities.list.find((e) => e.type === 'smiler');
  check(sm && Math.hypot(sm.pos.x - 17, sm.pos.z - 17) < 0.01, `the placed smiler stands where it was put (${sm ? sm.pos.x.toFixed(1) + ', ' + sm.pos.z.toFixed(1) : 'missing'})`);
}

const real = problems.filter((p) => !/GPU stall/.test(p.msg));
for (const p of real) console.log('  ! ' + p.kind + ': ' + p.msg.slice(0, 300));
console.log(`\n${bad ? bad + ' check(s) failed' : 'all stage checks passed'}`);
process.exit(bad || real.length ? 1 : 0);
