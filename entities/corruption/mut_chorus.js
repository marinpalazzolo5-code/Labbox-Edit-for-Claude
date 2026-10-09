// =============================================================================
//  The Chorus   (entity id: 'mut_chorus', a Corruption variant of 'smiler')
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

variant('mut_chorus', 'smiler', { heads: 2, arms: 2, tint: ['#9aa89a'], stretch: { arms: 1.3 }, jitter: 0.02, hs: 1.06 }, {
  name: 'The Chorus', speed: 0.9, chase: 2.3, detect: 8, dmg: 40, reach: 1.55, cd: 1.4, memory: 8,
  num: 'Δ · mutation of Entity 3', cls: 'Hostile', size: '~2.1 m, three heads',
  desc: 'A Smiler that was left in the dark too long. The grin split and grew back three times; every mouth is a little out of step with the others.',
  notes: 'Still only exists where the light fails, and still vanishes under working lights, but it is no longer quiet: the three mouths hum different notes, and you can hear it a long way before you can see it. Two of the arms are new.',
  tips: ['Treat the humming as a warning. It means the dark is close.', 'Stay under working lights, and do not trust a flickering one.', 'It is slower than the original. It has three heads to keep track of you with.'],
}, 'wail');
})();
