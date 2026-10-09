// ============================================================================
// RIDES TEST. The moving set pieces have to move whoever stands on them:
//
//   * a carousel turns, its horses ride their poles, and standing on its deck
//     carries the player round the centre;
//   * an escalator's steps carry the player up the incline to the top landing
//     without a single key pressed.
//
//   * a slide is ridden to each of its endings: the safe ones (door, lobby,
//     hatch) put the player back on their feet, the bad ones (jaws, grinder,
//     whirlpool, drop) kill.
//
//   node tools/playtest/rides.mjs            pg07 (carousel), pg10 (escalators), pg04 (slides)
//   node tools/playtest/rides.mjs pg10       one level
// ============================================================================
import { bootGame } from './boot.mjs';

const b = bootGame();
if (!b.game) { console.log('BOOT FAILED'); process.exit(1); }
const { game, clock, LEVELS, input, problems } = b;

const asked = process.argv.slice(2);
const list = asked.length ? asked : ['pg07', 'pg10', 'pg04'];
let bad = 0;

function propsOf(type) {
  const out = [];
  for (const l of game.world.layouts.values()) for (const p of l.props) if (p.type === type) out.push(p);
  return out;
}

for (const id of list) {
  const lv = LEVELS.find((l) => l.id === id);
  if (!lv) { console.log(`FAIL ${id}: no such level`); bad++; continue; }
  game.state = 'menu';
  game.enter(id).catch((e) => problems.push({ kind: 'enter', msg: String(e) }));
  let n = 0;
  while (game.state === 'loading' && n++ < 6000) await clock.settle(1);
  game.state = 'play';
  input.locked = true;
  const pl = game.player;
  // nobody should eat the tester half way up an escalator
  for (const e of game.entities.list) e.hidden = true;
  game.entities.update = () => {};

  const world = game.world;
  const slides = game.objectives.goals.filter((g) => g.type === 'slide');
  if (slides.length) {
    const g = slides[0];
    for (const ending of ['door', 'lobby', 'hatch', 'jaws', 'grinder', 'whirlpool', 'drop']) {
      const safe = ['door', 'lobby', 'hatch'].includes(ending);
      game.state = 'play'; pl.dead = false; pl.health = 100;
      let landed = false;
      pl.pos.set(g.x + Math.sin(g.rot) * 1.3, g.y, g.z + Math.cos(g.rot) * 1.3);
      game.ride(g, safe, 5, () => { landed = true; }, ending);
      let n = 0;
      while (game.rideLock && n++ < 60 * 20) await clock.settle(1);
      const died = game.state === 'dead';
      const ok = safe ? landed && !died : died;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} slide ending '${ending}': ${died ? 'died' : landed ? 'climbed out' : 'still riding'} after ${(n / 60).toFixed(1)} s`);
      if (!ok) bad++;
      if (died) { game.respawn(); await clock.settle(2); }
    }
  }
  const carousels = propsOf('carousel'), escalators = propsOf('escalator');
  if (!carousels.length && !escalators.length && !slides.length) { console.log(`FAIL ${id}: no carousel or escalator was generated`); bad++; continue; }
  if (!slides.length && !world.movers.size) { console.log(`FAIL ${id}: nothing is moving (no movers registered)`); bad++; continue; }

  const sp = lv.spawn || [16, 16];
  const near = (a) => a.slice().sort((p, q) => Math.hypot(p.x - sp[0], p.z - sp[1]) - Math.hypot(q.x - sp[0], q.z - sp[1])).slice(0, 2);
  for (const p of near(carousels)) {
    world.update(0, p.x, p.z);
    const r0 = [p.x + 2.6, p.z];
    pl.pos.set(r0[0], 0.4, r0[1]); pl.vel.set(0, 0, 0);
    for (let i = 0; i < 6 * 60; i++) await clock.settle(1);
    const a = Math.atan2(pl.pos.z - p.z, pl.pos.x - p.x), r = Math.hypot(pl.pos.x - p.x, pl.pos.z - p.z);
    const moved = Math.abs(a) > 0.5 && r > 1.2 && r < 3.3 && pl.pos.y > p.y + 0.2;
    console.log(`${moved ? 'ok  ' : 'FAIL'} ${id} carousel at (${p.x.toFixed(1)}, ${p.z.toFixed(1)}): carried ${(a * 180 / Math.PI).toFixed(0)} deg round, r=${r.toFixed(2)}, y=${pl.pos.y.toFixed(2)}`);
    if (!moved) bad++;
  }

  for (const p of near(escalators)) {
    if (p.opts.still) continue;
    const len = p.opts.len || 5.6, rise = p.opts.rise || 2.6;
    const c = Math.cos(p.rot), s = Math.sin(p.rot);
    const at = (lz) => [p.x + lz * s, p.z + lz * c];
    const z0 = -(len + 1.6) / 2;
    const [sx, sz] = at(z0 + 0.95);
    world.update(0, sx, sz);
    pl.pos.set(sx, p.y + 0.2, sz); pl.vel.set(0, 0, 0);
    let top = 0;
    for (let i = 0; i < 60 * Math.ceil(len / 0.7 + 4); i++) { await clock.settle(1); top = Math.max(top, pl.pos.y - p.y); }
    const ok = top > rise - 0.1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${id} escalator at (${p.x.toFixed(1)}, ${p.z.toFixed(1)}): carried up ${top.toFixed(2)} m of ${rise.toFixed(2)} m`);
    if (!ok) bad++;
  }
}

const real = problems.filter((p) => !/levels\/hell\//.test(p.msg));
for (const p of real) console.log('  ! ' + p.kind + ': ' + p.msg.slice(0, 300));
console.log(`\n${bad ? bad + ' ride(s) did not move the player' : 'every ride moved the player'}`);
process.exit(bad || real.length ? 1 : 0);
