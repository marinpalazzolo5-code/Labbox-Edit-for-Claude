// =============================================================================
//  The Drowned Howler   (entity id: 'mut_drowned', a Corruption variant of 'howler')
//
//  A creature from the original levels that was left to rot for a thousand years: the
//  base creature's model bent by core/mutate.js (more heads, more limbs, a body that
//  no longer holds still) plus an ENTITY_DEFS entry copied from the base creature, so it
//  keeps the base's senses and habits (watcher, crawler, statue, howl, darkOnly, ...).
//  Born in the Corruption pack, but the Playground levels use it too, so it lives in
//  entities/base/ and any level of any pack may use it.
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

variant('mut_drowned', 'howler', { heads: 2, tint: ['#7f9aa8', '#9fb0b4'], stretch: { arms: 1.25 }, jitter: 0.02 }, {
  name: 'The Drowned Howler', speed: 1.3, chase: 4.6, detect: 9, dmg: 32, reach: 1.6, cd: 1.2, memory: 4,
  num: 'Δ · mutation of Howler', cls: 'Hostile', size: '~2.1 m, three heads',
  desc: 'A Howler that has spent a thousand years standing in water. It is grey, swollen and dripping, and it has three heads, all of which can howl.',
  notes: 'Hunts by sound like the original and shrieks like it when it finds you, but three heads means three times the noise, and it hears you over running water as easily as in a quiet room.',
  tips: ['Move quietly even where the water is loud.', 'The current helps it as much as it helps you.', 'Do not splash.'],
}, 'wail');
})();
