// =============================================================================
//  The Splice   (entity id: 'mut_splice', a Corruption variant of 'skinstealer')
//
//  A creature from the original levels that was left to rot for a thousand years: the
//  base creature's model bent by core/mutate.js (more heads, more limbs, a body that
//  no longer holds still) plus an ENTITY_DEFS entry copied from the base creature, so it
//  keeps the base's senses and habits (watcher, crawler, statue, howl, darkOnly, ...).
//  Corruption pack only: levels outside levels/corrupt/ cannot use it.
// =============================================================================
(function () {
'use strict';
const __mod = (window.__mod = window.__mod || {});
const { ENTITY_DEFS, BUILDERS } = __mod['src/entities/registry.js'];
const { mutated } = __mod['src/entities/mutate.js'];
const VOICES = __mod['src/phobia/entities.js'].VOICES;

const variant = (id, base, build, def, voice) => {
  BUILDERS[id] = mutated(base, build);
  ENTITY_DEFS[id] = { ...ENTITY_DEFS[base], rare: false, pack: 'corruption', voice, ...def };
  VOICES[id] = voice;
};

variant('mut_splice', 'skinstealer', { heads: 1, arms: 2, tint: ['#b8b4a0', '#8a8f78'], stretch: { arms: 1.15 }, jitter: 0.03 }, {
  name: 'The Splice', speed: 1.1, chase: 3.0, detect: 12, dmg: 34, reach: 1.7, cd: 1.3, memory: 7,
  num: 'Δ · mutation of Skin Stealer', cls: 'Hostile', size: '~2.2 m',
  desc: 'A Skin Stealer wearing two faces and reaching with four arms. The second head does not seem to belong to it, and does not seem to be asleep.',
  notes: 'Behaves like the creature it grew from, but a thousand years of wearing other things has left it with too many of them. It reaches farther than it should, and it keeps reaching after you are past.',
  tips: ['Keep the whole body of a wall between you and it.', 'It can reach round a corner. Give corners a wide berth.'],
}, 'groan');
})();
