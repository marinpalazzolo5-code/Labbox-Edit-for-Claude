// =============================================================================
//  Demon   (entity id: 'demon')
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
const { animateQuad, ellipsoid, Rig, skinMat, xf } = __mod['src/entities/rig.js'];
const { ENTITY_DEFS } = __mod['src/entities/registry.js'];

/** A quadruped: Demon. fast agile beast haunting the realm */
function buildDemon(rng) {
  const p = { ...HUMAN, hipH: 1.71111, thigh: 0.923611, shin: 0.849722, spine: 0.661111, chestH: 0.661111, neck: 0.260867, shoulderW: 0.870815, upperArm: 0.775833, foreArm: 0.738889, chestW: 0.5022, armR: 1.4413, legR: 1.52366, headR: 0.098 };
  const rig = new Rig(p);
  const skinT = organic('demon-skin', { base: '#6c4332', dark: '#38160a', light: '#b69d6d', veins: 0.75, pores: 0.4, mottle: 0.7 });
  const skin = fleshMat(skinT, { rough: 0.6, bumpScale: 0.9 });
  const botT = cloth('demon-hide', { base: '#6a4444', dark: '#101010', weave: 80 });
  const bottom = skinMat('#a8a8a8', { map: botT.map, bump: botT.bump, bumpScale: 1.0, rough: 0.9 });
  const shoes = skinMat('#1a1714', { rough: 0.4 });
  const clawM = skinMat('#1c1a18', { rough: 0.3 });
  const hornM = skinMat('#b69d6d', { rough: 0.35 });
  buildBody(rig, p, { skin, top: skin, bottom: skin, shoes }, { sleeve: true, claws: 0.045, clawMat: clawM, chestDepth: 0.55, fingerLen: 0.07, belly: 1.45, neckR: 0.86 });
  const hl = headLift(p);
  // a low animal skull; the quad walker pitches the neck forward for you
  rig.attach(rig.head, xf(ellipsoid(p.headR * 1.098, p.headR * 0.816, p.headR * 1.35, 24, 18), { y: hl, z: p.headR * 0.4 }), skin, { parent: rig.neck, axis: [0, 1, 0], len: 1, bw: 0.015 });
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.7564, p.headR * 0.48, p.headR * 1.1, 20, 16), { y: hl - p.headR * 0.32, z: p.headR * 1.5 }), skin, { parent: rig.neck, axis: [0, 1, 0], len: 1, bw: 0.01 });
  const gum = skinMat('#38160a', { rough: 0.35 });
  // a lower jaw, pushed out by the jaw control
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.5175, p.headR * 0.25, p.headR * 1.5, 20, 14), { y: hl - p.headR * 0.42, z: p.headR * 1.625 }), gum, { rigid: true, shadow: false });
  rig.attach(rig.head, xf(ellipsoid(p.headR * 0.5, p.headR * 0.1, p.headR * 1.15, 18, 12), { y: hl - p.headR * 0.42, z: p.headR * 1.15 }), gum, { rigid: true, shadow: false });
  const eyeM = skinMat('#f4f2ec', { rough: 0.15 });
  for (const s of [-1, 1]) rig.attach(rig.head, xf(ellipsoid(0.04408, 0.010374, 0.01672), { x: s * 0.0495, y: hl + p.headR * 0.25, z: p.headR * 1.85, rz: s * 0.7 }), eyeM, { rigid: true, shadow: false });
  // a brow ridge over the eyes
  for (const s of [-1, 1]) rig.attach(rig.head, xf(ellipsoid(0.056925, 0.0086, 0.031768), { x: s * 0.047025, y: hl + p.headR * 0.5 + 0.0135, z: p.headR * 1.6, rz: s * 0.7 }), skin, { rigid: true });
  // a mouth slot and a real row of teeth:
  const toothM = skinMat('#b69d6d', { rough: 0.25 });
  for (let i = 0; i < 8; i++) {
    const t = (i / 7) * 2 - 1;
    rig.attach(rig.head, xf(new THREE.BoxGeometry(0.0231, 0.0099, 0.01089), { x: t * p.headR * 0.832, y: hl - p.headR * 0.3 + 0.004, z: p.headR * 1.62 - 0.032 * t * t, rz: t * 0.08 }), toothM, { rigid: true, shadow: false });
  }
  // horns, curving back over the skull
  for (let i = 0; i < 2; i++) {
    const sx = (i % 2 ? 1 : -1) * (0.032 + 0.022 * Math.floor(i / 2));
    rig.attach(rig.head, xf(new THREE.ConeGeometry(0.02, 0.07, 7), { x: sx, y: hl + p.headR * 0.85, rz: sx * -0.35 }), hornM, { rigid: true });
    rig.attach(rig.head, xf(new THREE.ConeGeometry(0.013, 0.09, 7), { x: sx * 1.6, y: hl + p.headR * 1.15, z: -p.headR * 0.2, rz: sx * -0.7 }), hornM, { rigid: true });
  }

  return result(rig, {
    kind: 'quad', height: 2.1, radius: 0.6696, eyeY: 1.6625,
    animate(stt, dt) {
      stt.stride = 2.2;
      if (stt.pitch === undefined) stt.pitch = 1.18;
      animateQuad(rig, stt, dt);
    },
  });
}

__mod['src/entities/registry.js'].BUILDERS['demon'] = buildDemon;

ENTITY_DEFS['demon'] = {
  name: 'Demon', speed: 3, chase: 4, detect: 12, dmg: 25, reach: 1.5, cd: 0.9, memory: 6, crawler: true, howl: true,
  num: 'Entity 166', cls: 'Lethal', size: '1.65m',
  desc: 'vicious crawling beast lured from tortured souls of the underworld',
  notes: 'fast entity from the depths of hell',
  tips: ['run away, avoid contact'],
};
})();
