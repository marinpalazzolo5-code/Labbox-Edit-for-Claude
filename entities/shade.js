// =============================================================================
//  Shade   (entity id: 'shade')
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
const { buildBody, cloth, fleshMat, headLift, headOn, HUMAN, organic, result } = __mod['src/entities/models.js'].HELPERS;
const { animateBiped, ellipsoid, glowMat, Rig, setLight, skinMat, xf } = __mod['src/entities/rig.js'];
const { ENTITY_DEFS } = __mod['src/entities/registry.js'];

/** A humanoid: Shade. Fast wisp of a departed soul */
function buildShade(rng) {
  const p = { ...HUMAN, hipH: 0.686111, thigh: 0.40625, shin: 0.388194, spine: 0.144444, chestH: 0.231111, neck: 0.042, shoulderW: 0.281424, upperArm: 0.270833, foreArm: 0.24375, chestW: 0.19188, armR: 0.3861, legR: 0.3861, headR: 0.08512 };
  const rig = new Rig(p);
  const skinT = organic('shade-skin', { base: '#000000', dark: '#000000', light: '#611d00', veins: 0.45, pores: 0.4, mottle: 0 });
  const skin = fleshMat(skinT, { rough: 1, bumpScale: 0.9 });
  const botT = cloth('shade-hide', { base: '#000000', dark: '#101010', weave: 80 });
  const bottom = skinMat('#a8a8a8', { map: botT.map, bump: botT.bump, bumpScale: 1.0, rough: 0.9 });
  const shoes = skinMat('#1a1714', { rough: 0.4 });
  const clawM = skinMat('#1c1a18', { rough: 0.3 });
  const hornM = skinMat('#611d00', { rough: 0.35 });
  buildBody(rig, p, { skin, top: skin, bottom: skin, shoes }, { sleeve: true, claws: 0.03, clawMat: clawM, belly: 0.78, neckR: 1.06 });
  const hl = headLift(p);
  headOn(rig, p, skin, 0.86, 1.06, 1.34);
  // a lower jaw, pushed out by the jaw control
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.63, p.headR * 0.242, p.headR * 0.99, 20, 14), { y: hl - p.headR * 0.52, z: p.headR * 0.73 }), skin, { rigid: true, shadow: false });
  const eyeM = glowMat('#ff9e9e', { fog: false });
  for (const s of [-1, 1]) rig.attach(rig.head, xf(ellipsoid(0.03654, 0.008232, 0.0112), { x: s * 0.0462, y: hl + 0.022, z: p.headR * 1.35, rz: s * -0.5 }), eyeM, { rigid: true, shadow: false });
  // a brow ridge over the eyes
  for (const s of [-1, 1]) rig.attach(rig.head, xf(ellipsoid(0.05313, 0.008, 0.02128), { x: s * 0.04389, y: hl + 0.05 + 0.01125, z: p.headR * 1.3, rz: s * -0.5 }), skin, { rigid: true });
  // a mouth slot and a real row of teeth:
  const toothM = skinMat('#611d00', { rough: 0.25 });
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.56672, p.headR * 0.028, p.headR * 0.07, 16, 10), { y: hl - p.headR * 0.5, z: p.headR * 1.02 }), skinMat('#000000', { rough: 0.4 }), { rigid: true, shadow: false });
  for (let i = 0; i < 4; i++) {
    const t = (i / 3) * 2 - 1;
    rig.attach(rig.head, xf(new THREE.ConeGeometry(0.0171, 0.0648, 5), { x: t * p.headR * 0.616, y: hl - p.headR * 0.5 + 0.004, z: p.headR * 1.02 - 0.0308 * t * t, rz: t * 0.08, rx: Math.PI }), toothM, { rigid: true, shadow: false });
  }
  // horns, curving back over the skull
  for (let i = 0; i < 2; i++) {
    const sx = (i % 2 ? 1 : -1) * (0.032 + 0.022 * Math.floor(i / 2));
    rig.attach(rig.head, xf(new THREE.ConeGeometry(0.02, 0.07, 7), { x: sx, y: hl + p.headR * 0.85, rz: sx * -0.35 }), hornM, { rigid: true });
    rig.attach(rig.head, xf(new THREE.ConeGeometry(0.013, 0.09, 7), { x: sx * 1.6, y: hl + p.headR * 1.15, z: -p.headR * 0.2, rz: sx * -0.7 }), hornM, { rigid: true });
  }

  return result(rig, {
    kind: 'biped', height: 1.3, radius: 0.17056, eyeY: 1.196,
    animate(stt, dt) {
      stt.stride = 1.1;
      animateBiped(rig, stt, dt);
      const g = 0.72 + 0.28 * Math.sin(stt.t * 2.3 + (stt.chasing ? 2 : 0));
      setLight([eyeM], g, g, g);
    },
  });
}

__mod['src/entities/registry.js'].BUILDERS['shade'] = buildShade;

ENTITY_DEFS['shade'] = {
  name: 'Shade', speed: 2, chase: 0, detect: 12, dmg: 18, reach: 1.35, cd: 0.9, memory: 4, passive: true, crawler: true, howl: true,
  num: 'Entity 100', cls: 'Passive', size: '1.4m tall',
  desc: 'Fast wisp of a departed soul',
  notes: 'safe not much known',
  tips: ['avoid'],
};
})();
