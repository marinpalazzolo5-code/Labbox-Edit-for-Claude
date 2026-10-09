// =============================================================================
//  The Sprawl   (entity id: 'mut_sprawl', a Corruption variant of 'crawler')
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

variant('mut_sprawl', 'crawler', { arms: 4, legs: 2, tint: ['#a8a090'], stretch: { arms: 1.35 }, jitter: 0.03 }, {
  name: 'The Sprawl', speed: 1.4, chase: 6.2, detect: 14, dmg: 26, reach: 1.5, cd: 1.0, memory: 4,
  num: 'Δ · mutation of Crawler', cls: 'Lethal', size: '~2 m across, eight limbs',
  desc: 'A Crawler that never stopped growing. Too many arms, too many knees, and a way of arriving at a corner a moment before the sound does.',
  notes: 'Peeks, flees when seen, and then bursts, like the Crawler. It gets more reach out of that burst than anything that size should, and the extra limbs make its approach almost silent on a dry floor.',
  tips: ['Do not let it count your glances.', 'It retreats when you look. It comes back when you stop.', 'Do not run into an open space with it behind you.'],
}, 'chitter');
})();
