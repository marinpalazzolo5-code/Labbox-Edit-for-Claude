// =============================================================================
//  The Thicket   (entity id: 'mut_thicket', a Corruption variant of 'stature')
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

variant('mut_thicket', 'stature', { arms: 4, tint: ['#7f9a78', '#a8b49a'], stretch: { arms: 1.2 }, jitter: 0.02 }, {
  name: 'The Thicket', speed: 0.9, chase: 3.6, detect: 28, dmg: 45, reach: 2.6, cd: 1.8, memory: 10,
  num: 'Δ · mutation of The Stature', cls: 'Lethal', size: '3.4 m standing, six arms',
  desc: 'The Stature, overgrown. Moss has taken its shoulders and four extra arms have pushed out of its back, each as long as the first two.',
  notes: 'Frozen while watched and swift when not, exactly like the original. The extra arms never freeze: they keep moving, slowly, even while the rest of it stands perfectly still, which is the only way to tell it is there.',
  tips: ['If something in the corner of your eye is moving and nothing else is, it is that.', 'Glance at it, do not stare.', 'Low ceilings slow it.'],
}, 'creak');
})();
