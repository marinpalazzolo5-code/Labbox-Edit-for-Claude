// =============================================================================
//  The Fractured   (entity id: 'mut_fractured', a Corruption variant of 'mannequin')
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

variant('mut_fractured', 'mannequin', { heads: 1, arms: 2, tint: ['#cfc8b8'], stretch: { arms: 1.25 }, jitter: 0.04 }, {
  name: 'The Fractured', speed: 0, chase: 5.6, detect: 24, dmg: 32, reach: 1.6, cd: 1.1, memory: 45,
  num: 'Δ · mutation of Mannequin', cls: 'Hostile', size: '~1.9 m, two heads',
  desc: 'A cracked mannequin with a second head glued on crooked and two spare arms fixed at the ribs. Hairline fractures run through all of it.',
  notes: 'Moves only when unobserved, like any Mannequin. Where the original keeps its stillness, this one cannot: it shivers whenever it is watched, as if something inside is trying to get out of the shell.',
  tips: ['Shivering means it is watched and holding. Keep looking.', 'Never turn your back on a room with one in it.', 'Two heads means two chances to catch it moving.'],
}, 'creak');
})();
