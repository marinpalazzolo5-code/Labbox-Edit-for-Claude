// =============================================================================
//  Gremlin   (entity id: 'gremlin')
//
//  One self-contained entity file, written with other/entity-studio.html:
//    - the three.js model builder
//    - its stats / field-guide entry
//  Preview it live with other/entity-viewer.html (rotate, wander, sprint).
//  Shared building blocks live in entities/core/.
// =============================================================================
(function () {
'use strict';
const __mod = (window.__mod = window.__mod || {});
const THREE = __mod['vendor/three/build/three.module.js'];
const { buildBody, cloth, fleshMat, headLift, HUMAN, organic, result } = __mod['src/entities/models.js'].HELPERS;
const { animateQuad, ellipsoid, glowMat, Rig, setLight, skinMat, xf } = __mod['src/entities/rig.js'];
const { ENTITY_DEFS } = __mod['src/entities/registry.js'];

/** A quadruped: Gremlin. Guards its realm like it doesnt want you in... or out */
function buildGremlin(rng) {
  const p = { ...HUMAN, hipH: 1.36889, thigh: 0.645556, shin: 0.593911, spine: 0.528889, chestH: 0.528889, neck: 0.311111, shoulderW: 0.459, upperArm: 0.542267, foreArm: 0.516444, chestW: 0.405, armR: 1.015, legR: 1.073, headR: 0.16 };
  const rig = new Rig(p);
  const skinT = organic('gremlin-skin', { base: '#88444e', dark: '#66002c', light: '#ee6db8', veins: 1, pores: 0.4, mottle: 0.3 });
  const skin = fleshMat(skinT, { rough: 0.9, bumpScale: 0.9 });
  const botT = cloth('gremlin-hide', { base: '#630808', dark: '#101010', weave: 80 });
  const bottom = skinMat('#a8a8a8', { map: botT.map, bump: botT.bump, bumpScale: 1.0, rough: 0.9 });
  const shoes = skinMat('#1a1714', { rough: 0.4 });
  const clawM = skinMat('#1c1a18', { rough: 0.3 });
  const hornM = skinMat('#ee6db8', { rough: 0.35 });
  buildBody(rig, p, { skin, top: skin, bottom: skin, shoes }, { sleeve: true, claws: 0.045, clawMat: clawM, chestDepth: 0.55, fingerLen: 0.07 });
  const hl = headLift(p);
  // a low animal skull; the quad walker pitches the neck forward for you
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.9, p.headR * 0.85, p.headR * 1.35, 24, 18), { y: hl, z: p.headR * 0.4 }), skin, { parent: rig.neck, axis: [0, 1, 0], len: 1, bw: 0.015 });
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.62, p.headR * 0.5, p.headR * 1.1, 20, 16), { y: hl - p.headR * 0.32, z: p.headR * 1.5 }), skin, { parent: rig.neck, axis: [0, 1, 0], len: 1, bw: 0.01 });
  const gum = skinMat('#66002c', { rough: 0.35 });
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.5, p.headR * 0.1, p.headR * 1.15, 18, 12), { y: hl - p.headR * 0.42, z: p.headR * 1.15 }), gum, { rigid: true, shadow: false });
  const eyeM = glowMat('#ff4b1f', { fog: false });
  for (const x of [-0.045, 0.045]) rig.attach(rig.head, xf(ellipsoid(0.016, 0.013, 0.011), { x, y: hl + p.headR * 0.25, z: p.headR * 1.85 }), eyeM, { rigid: true, shadow: false });

  return result(rig, {
    kind: 'quad', height: 1.68, radius: 0.54, eyeY: 1.33,
    animate(stt, dt) {
      stt.stride = 2.2;
      if (stt.pitch === undefined) stt.pitch = 1.18;
      animateQuad(rig, stt, dt);
      const g = 0.72 + 0.28 * Math.sin(stt.t * 2.3 + (stt.chasing ? 2 : 0));
      setLight([eyeM], g, g, g);
    },
  });
}

__mod['src/entities/registry.js'].BUILDERS['gremlin'] = buildGremlin;

ENTITY_DEFS['gremlin'] = {
  name: 'Gremlin', speed: 1.8, chase: 3, detect: 12, dmg: 25, reach: 1.35, cd: 1.4, memory: 6, crawler: true, howl: true,
  num: 'Entity 166', cls: 'Hostile', size: '1.5 m long, low to the floor',
  desc: 'Guards its realm like it doesnt want you in... or out',
  notes: 'Guards its realm, chases anyone.',
  tips: ['Break the chase around a corner.', 'It is slow up stairs.'],
};
})();
