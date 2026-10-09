// =============================================================================
//  PLAYGROUND PACK creatures   (ids: pg_lifeguard, pg_mascot, pg_attendant,
//                                    pg_bouncer, pg_ringmaster)
//
//  The Playground keeps the original lineup, and dresses it for the party: same senses and
//  habits as the creatures they come from (they inherit the base creature's behaviour
//  flags). Each one is the base model built by core/mutate.js, then dressed here with
//  the base's own skin and cloth textures swapped for painted ones, and with a painted
//  face (or costume, or hat) on every head. The base textures are kept, so the skin still
//  has its pores, veins and wrinkles under the paint.
// =============================================================================
(function () {
'use strict';
const __mod = (window.__mod = window.__mod || {});
const { ENTITY_DEFS, BUILDERS } = __mod['src/entities/registry.js'];
const { mutated } = __mod['src/entities/mutate.js'];
const VOICES = __mod['src/phobia/entities.js'].VOICES;
const THREE = __mod['vendor/three/build/three.module.js'];
const { TEX, tex, noiseFill, headLift, srgbHex } = __mod['src/entities/models.js'].HELPERS;
const { canvasTex, ellipsoid, facePlate, glowMat, paintTex, skinMat, xf } = __mod['src/entities/rig.js'];

// ------------------------------------------------------------------ small helpers
const rnd = (s) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

/** Dashed-free crack lines across a porcelain or painted surface. */
function cracks(g, w, h, seed, n, len, col) {
  g.strokeStyle = col; g.lineWidth = 1.3; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    let x = rnd(seed + i * 3.1) * w, y = rnd(seed + i * 7.7) * h, a = rnd(seed + i * 1.3) * Math.PI * 2;
    g.beginPath(); g.moveTo(x, y);
    for (let k = 0; k < len; k++) {
      a += (rnd(seed + i * 11 + k) - 0.5) * 0.9;
      x += Math.cos(a) * w * 0.02; y += Math.sin(a) * w * 0.02;
      g.lineTo(x, y);
    }
    g.stroke();
  }
}

/** Every head on a built creature: the head bone and any copies made by mutated(). */
function headsOf(m) {
  return m.rig.neck.children.filter((c) => c.isBone);
}

/** A rigid part (no skinning) hung on a bone. Parts added here show up in collect(). */
function put(m, bone, geo, mat) {
  return m.rig.attach(bone, geo, mat, { rigid: true, shadow: false });
}

/** A painted face on the front of a head, placed the way models-kit's face() places it. */
function faceOn(m, bone, H, map, o = {}) {
  const g = facePlate(H.r * 1.03, o.w ?? 1.7, o.h ?? 1.6);
  g.scale(H.sx, H.sy, H.sz);
  put(m, bone, xf(g, { y: H.lift + (o.y || 0), z: o.z || 0 }), skinMat('#ffffff', { map, rough: o.rough ?? 0.6 }));
}

/** Point every material of this model that uses the builder's texture `from` at a new one. */
function reskin(m, from, map, bump = null) {
  const old = TEX[from];
  const src = old && (old.isTexture ? old : old.map);
  if (!src) throw new Error('playground: the base model has no texture called ' + from);
  m.root.traverse((o) => {
    if (!o.material) return;
    for (const mat of Array.isArray(o.material) ? o.material : [o.material]) {
      if (mat.map === src) { mat.map = map; mat.bumpMap = bump; mat.needsUpdate = true; }
    }
  });
}

/** Rebuild the lit / glow material lists after parts were added (the lighting pass reads them). */
function collect(m) {
  m.mats = []; m.glows = [];
  m.root.traverse((o) => {
    if (!o.isMesh && !o.isSprite) return;
    for (const mat of Array.isArray(o.material) ? o.material : [o.material]) {
      if (mat.isMeshBasicMaterial || mat.isSpriteMaterial) { if (!m.glows.includes(mat)) m.glows.push(mat); } else if (!m.mats.includes(mat)) m.mats.push(mat);
    }
  });
}

// ------------------------------------------------------------------ The Lifeguard
// Skin Stealer under a red and yellow tabard, torn open and bloodied. The stolen face is
// painted over: sunburnt, behind mirrored lifeguard sunglasses, with a red glow leaking out.
const lgRags = () => tex('pg_lg_rags', () => paintTex(256, 256, (u, v, N, out) => {
  const band = (u + v * 0.5) * 6 + N.fbm(u, v, 3, 3) * 0.3;
  const f = band - Math.floor(band);
  let c = f < 0.5 ? srgbHex('#c81e16') : srgbHex('#f0c020');
  const tear = sm(0.66, 0.74, N.fbm(u, v, 4, 4));          // torn right through to the skin
  c = mix(c, srgbHex('#6b4438'), tear);
  out.h = 0.5 - tear * 0.35 + (N.fbm(u, v, 12, 3) - 0.5) * 0.2;
  const blood = sm(0.6, 0.72, N.fbm(u + 2, v, 5, 4)) * sm(0.35, 0.8, v);
  c = mix(c, srgbHex('#4a0808'), blood * 0.8);
  const grime = sm(0.45, 0.8, N.fbm(u + 4, v + 1, 6, 4));
  c = mix(c, srgbHex('#2a2420'), grime * 0.45);
  return c;
}, { bump: true }));

const lgFace = () => tex('pg_lg_face', () => canvasTex(512, 512, (g, w, h) => {
  noiseFill(g, w, h, '#c98a6a', ['#a0503a', '#e0a07e', '#7a2e22']);
  // peeling sunburn
  for (let i = 0; i < 14; i++) {
    g.fillStyle = 'rgba(232,200,160,0.35)';
    g.beginPath(); g.ellipse(w * rnd(i * 2.1), h * rnd(i * 5.3), w * 0.04, h * 0.025, rnd(i) * 3, 0, Math.PI * 2); g.fill();
  }
  // red glow leaking out from under the mirrored lenses
  for (const x of [0.35, 0.65]) {
    const gr = g.createRadialGradient(w * x, h * 0.5, 2, w * x, h * 0.5, w * 0.16);
    gr.addColorStop(0, 'rgba(255,40,30,0.9)'); gr.addColorStop(1, 'rgba(255,40,30,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(w * x, h * 0.5, w * 0.16, h * 0.1, 0, 0, Math.PI * 2); g.fill();
    // lens: black, with two hard reflections
    g.fillStyle = '#050505'; g.beginPath(); g.ellipse(w * x, h * 0.42, w * 0.12, h * 0.08, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(w * (x - 0.07), h * 0.4); g.lineTo(w * (x - 0.03), h * 0.36); g.stroke();
    g.beginPath(); g.moveTo(w * (x + 0.02), h * 0.46); g.lineTo(w * (x + 0.06), h * 0.43); g.stroke();
  }
  g.strokeStyle = '#050505'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(w * 0.47, h * 0.42); g.lineTo(w * 0.53, h * 0.42); g.stroke();
  // blood from one nostril
  g.strokeStyle = '#5e0a0a'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.moveTo(w * 0.49, h * 0.5); g.bezierCurveTo(w * 0.48, h * 0.56, w * 0.5, h * 0.6, w * 0.47, h * 0.67); g.stroke();
  // a grin with cracked lips and broken teeth
  g.fillStyle = '#1c0505'; g.beginPath(); g.ellipse(w * 0.5, h * 0.72, w * 0.2, h * 0.07, 0, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 10; i++) {
    g.fillStyle = rnd(i * 4.4) > 0.2 ? 'rgba(236,228,210,0.95)' : 'rgba(120,90,70,0.9)';
    g.fillRect(w * (0.32 + i * 0.04), h * 0.68, w * 0.025, h * 0.04);
  }
  cracks(g, w * 0.5, h * 0.2, 5, 3, 6, 'rgba(70,20,15,0.8)');
  g.save(); g.translate(w * 0.3, h * 0.6); cracks(g, w * 0.2, h * 0.2, 9, 2, 5, 'rgba(70,20,15,0.8)'); g.restore();
}));

// ------------------------------------------------------------------ The Mascot
// A stature in a pink and yellow costume: the seams are stitched, the eyes are buttons, and
// the grin is cut into the fabric with teeth and a smear of something red at the corner.
const msSuit = () => tex('pg_ms_suit', () => paintTex(256, 256, (u, v, N, out) => {
  const s = u * 8 + N.fbm(u, v, 3, 3) * 0.25;
  const f = s - Math.floor(s);
  let c = f < 0.5 ? srgbHex('#ff8fc0') : srgbHex('#ffd23a');
  const seam = sm(0.035, 0, Math.abs(f - 0.5)) + sm(0.035, 0, Math.min(f, 1 - f));
  c = mix(c, srgbHex('#2a0a1c'), seam * 0.9);
  out.h = 0.6 - seam * 0.3 + 0.2 * Math.sin(Math.PI * 2 * f);   // puffed panels
  const stain = sm(0.6, 0.8, N.fbm(u + 1, v, 5, 4));
  c = mix(c, srgbHex('#8a6a5a'), stain * 0.4);
  return c;
}, { bump: true, repeat: [1, 3] }));

const msCostume = () => tex('pg_ms_costume', () => canvasTex(512, 512, (g, w, h) => {
  // the costume wraps the whole head: panels, a stitched seam at each edge
  const n = 16;
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? '#ffd23a' : '#ff8fc0'; g.fillRect((i * w) / n, 0, w / n + 1, h); }
  g.strokeStyle = 'rgba(40,10,30,0.7)'; g.lineWidth = 2; g.setLineDash([6, 5]);
  for (let i = 0; i < n; i++) { g.beginPath(); g.moveTo((i * w) / n, 0); g.lineTo((i * w) / n, h); g.stroke(); }
  g.setLineDash([]);
  // the face: a cream patch with a huge grin
  g.fillStyle = '#fff3c4'; g.beginPath(); g.ellipse(w * 0.5, h * 0.5, w * 0.2, h * 0.3, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#120406';
  g.beginPath(); g.moveTo(w * 0.36, h * 0.56); g.quadraticCurveTo(w * 0.5, h * 0.9, w * 0.64, h * 0.56);
  g.quadraticCurveTo(w * 0.5, h * 0.62, w * 0.36, h * 0.56); g.fill();
  g.fillStyle = '#fffdf5';
  for (let i = 0; i < 7; i++) {
    const x = w * (0.38 + i * 0.038);
    g.beginPath(); g.moveTo(x, h * 0.57); g.lineTo(x + w * 0.017, h * 0.57); g.lineTo(x + w * 0.008, h * 0.61); g.fill();
  }
  // blood at the corner of the mouth
  g.strokeStyle = '#7a0a14'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(w * 0.36, h * 0.56); g.lineTo(w * 0.35, h * 0.66); g.lineTo(w * 0.36, h * 0.7); g.stroke();
  // button eyes, stitched in
  for (const x of [0.42, 0.58]) {
    g.fillStyle = '#0a0508'; g.beginPath(); g.ellipse(w * x, h * 0.4, w * 0.06, h * 0.065, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.8)'; g.beginPath(); g.ellipse(w * (x - 0.02), h * 0.38, w * 0.014, h * 0.014, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#2a1020'; g.lineWidth = 2; g.setLineDash([3, 3]);
    g.beginPath(); g.arc(w * x, h * 0.4, w * 0.075, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  }
}));

// ------------------------------------------------------------------ The Attendant
// A porcelain ticket-booth doll: painted cheeks, lashes, a smile that is too wide, and cracks.
const atFace = () => tex('pg_at_face', () => canvasTex(512, 512, (g, w, h) => {
  noiseFill(g, w, h, '#e9e3d8', ['#cfc6b8', '#f7f3ec', '#b5aa9b']);
  for (const x of [0.3, 0.7]) {
    const gr = g.createRadialGradient(w * x, h * 0.56, 2, w * x, h * 0.56, w * 0.11);
    gr.addColorStop(0, 'rgba(220,120,120,0.6)'); gr.addColorStop(1, 'rgba(220,120,120,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }
  for (const x of [0.36, 0.64]) {
    g.fillStyle = '#0b0708'; g.beginPath(); g.ellipse(w * x, h * 0.4, w * 0.075, h * 0.04, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w * (x + 0.015), h * 0.395, w * 0.02, h * 0.01, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#050303'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(w * (x - 0.08), h * 0.39); g.quadraticCurveTo(w * x, h * 0.33, w * (x + 0.08), h * 0.39); g.stroke();
    g.strokeStyle = '#3a2a24'; g.lineWidth = 4;
    g.beginPath(); g.moveTo(w * (x - 0.09), h * 0.29); g.quadraticCurveTo(w * x, h * 0.22, w * (x + 0.09), h * 0.29); g.stroke();
  }
  // a smile painted far too wide
  g.fillStyle = '#b3202e';
  g.beginPath(); g.moveTo(w * 0.28, h * 0.6); g.quadraticCurveTo(w * 0.5, h * 0.78, w * 0.72, h * 0.6);
  g.quadraticCurveTo(w * 0.5, h * 0.66, w * 0.28, h * 0.6); g.fill();
  g.strokeStyle = '#3a0508'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(w * 0.3, h * 0.6); g.lineTo(w * 0.7, h * 0.6); g.stroke();
  g.strokeStyle = '#b3202e'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(w * 0.28, h * 0.6); g.lineTo(w * 0.22, h * 0.55); g.stroke();
  g.beginPath(); g.moveTo(w * 0.72, h * 0.6); g.lineTo(w * 0.78, h * 0.55); g.stroke();
  // the crazing of old porcelain, and one chip
  cracks(g, w, h, 17, 9, 10, 'rgba(60,50,45,0.75)');
  g.fillStyle = '#8a7d70'; g.beginPath(); g.ellipse(w * 0.22, h * 0.36, w * 0.02, h * 0.015, 0.4, 0, Math.PI * 2); g.fill();
}));

// ------------------------------------------------------------------ The Bouncer
// A crawler that has been in the ball pit too long: bruised purple skin with the balls
// pressed into it, and an orange and purple striped torso.
const boSkin = () => tex('pg_bo_skin', () => paintTex(256, 256, (u, v, N, out) => {
  let c = mix(srgbHex('#6a4a9a'), srgbHex('#2a1438'), sm(0.35, 0.72, N.fbm(u, v, 4, 5)));
  c = mix(c, srgbHex('#8a7a2a'), sm(0.55, 0.75, N.fbm(u + 3, v, 7, 4)) * 0.5);      // yellowing bruises
  const [d1] = N.cell(u, v, 9);
  const id = N.n2(Math.floor(u * 9), Math.floor(v * 9));
  const ball = sm(0.22, 0.14, d1);
  c = mix(c, srgbHex(id < 0.33 ? '#ffd23a' : id < 0.66 ? '#3a8cff' : '#3ad07a'), ball * 0.9);
  out.h = 0.5 + ball * 0.25 - (N.fbm(u, v, 20, 2) - 0.5) * 0.1;
  return c;
}, { bump: true }));

const boTorso = () => tex('pg_bo_torso', () => paintTex(256, 256, (u, v, N, out) => {
  const s = u * 5 + v * 0.8 + N.fbm(u, v, 3, 4) * 0.3;
  const f = s - Math.floor(s);
  let c = f < 0.5 ? srgbHex('#ff7a2a') : srgbHex('#6a2ad0');
  const seam = sm(0.03, 0, Math.abs(f - 0.5)) + sm(0.03, 0, Math.min(f, 1 - f));
  c = mix(c, srgbHex('#1a0a20'), seam * 0.8);
  out.h = 0.5 - seam * 0.2 + (N.fbm(u, v, 10, 3) - 0.5) * 0.15;
  return c;
}, { bump: true, repeat: [1, 2] }));

// ------------------------------------------------------------------ The Ringmaster
// A howler in greasepaint: a white face with a red grin that goes too far, black diamond eyes
// with blue shadow and running mascara.
const rmFace = () => tex('pg_rm_face', () => canvasTex(256, 512, (g, w, h) => {
  noiseFill(g, w, h, '#ece4d6', ['#d8cdb9', '#fffaf0', '#c9bda8']);
  for (const x of [0.25, 0.75]) {
    g.fillStyle = 'rgba(230,60,60,0.5)'; g.beginPath(); g.ellipse(w * x, h * 0.45, w * 0.09, h * 0.05, 0, 0, Math.PI * 2); g.fill();
  }
  // the grin: red greasepaint, spiked at the corners
  g.fillStyle = '#c0141c';
  g.beginPath(); g.moveTo(w * 0.18, h * 0.5); g.quadraticCurveTo(w * 0.5, h * 0.86, w * 0.82, h * 0.5);
  g.quadraticCurveTo(w * 0.5, h * 0.66, w * 0.18, h * 0.5); g.fill();
  g.beginPath(); g.moveTo(w * 0.18, h * 0.5); g.lineTo(w * 0.07, h * 0.43); g.lineTo(w * 0.19, h * 0.55); g.fill();
  g.beginPath(); g.moveTo(w * 0.82, h * 0.5); g.lineTo(w * 0.93, h * 0.43); g.lineTo(w * 0.81, h * 0.55); g.fill();
  g.fillStyle = '#140305';
  g.beginPath(); g.moveTo(w * 0.24, h * 0.52); g.quadraticCurveTo(w * 0.5, h * 0.8, w * 0.76, h * 0.52);
  g.quadraticCurveTo(w * 0.5, h * 0.6, w * 0.24, h * 0.52); g.fill();
  g.fillStyle = '#ffffff';
  for (let i = 0; i < 7; i++) g.fillRect(w * (0.3 + i * 0.058), h * 0.53, w * 0.036, h * 0.04);
  // diamond eyes with blue shadow and running mascara
  for (const x of [0.32, 0.68]) {
    const cx = w * x, cy = h * 0.3;
    g.fillStyle = 'rgba(42,42,138,0.7)'; g.beginPath(); g.ellipse(cx, cy - h * 0.06, w * 0.12, h * 0.04, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#0c0c14';
    g.beginPath(); g.moveTo(cx, cy - h * 0.07); g.lineTo(cx + w * 0.1, cy); g.lineTo(cx, cy + h * 0.05); g.lineTo(cx - w * 0.1, cy); g.closePath(); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(cx + w * 0.03, cy - h * 0.02, w * 0.012, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - w * 0.04, cy + h * 0.05); g.lineTo(cx - w * 0.05, cy + h * 0.2); g.stroke();
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(cx - w * 0.1, cy - h * 0.1); g.quadraticCurveTo(cx, cy - h * 0.16, cx + w * 0.1, cy - h * 0.1); g.stroke();
  }
}));

// ------------------------------------------------------------------ builders
const H = {
  // the head shape of each base creature, as models-kit's headOn() sets it (see face())
  porcelain: { r: 0.095, lift: headLift({ headR: 0.095 }), sx: 0.96, sy: 1.2, sz: 1.02 },
  stature: { r: 0.085, lift: headLift({ headR: 0.085 }) + 0.03, sx: 1, sy: 1.45, sz: 1.05 },
  howler: { r: 0.10, lift: headLift({ headR: 0.10 }), sx: 0.75, sy: 1.7, sz: 0.85 },
  crawler: { r: 0.1, lift: headLift({ headR: 0.1 }), sx: 0.95, sy: 1.15, sz: 1.05 },
};

function dressLifeguard(m) {
  const rags = lgRags();
  reskin(m, 'rags', rags.map, rags.bump);
  reskin(m, 'stealer2', lgFace());
  // a red whistle on a cord, against the chest
  put(m, m.rig.neck, xf(new THREE.CylinderGeometry(0.011, 0.011, 0.045, 10), { y: -0.09, z: 0.07, rx: Math.PI / 2 }), skinMat('#e0392b', { rough: 0.3 }));
  collect(m);
}

function dressMascot(m) {
  const suit = msSuit();
  reskin(m, 'stature', suit.map, suit.bump);
  // the costume wraps the whole head, with the grin on the front
  const cos = msCostume();
  for (const head of headsOf(m)) {
    const g = facePlate(H.stature.r * 1.03, Math.PI * 2, Math.PI);   // a full sphere
    g.scale(H.stature.sx, H.stature.sy, H.stature.sz);
    put(m, head, xf(g, { y: H.stature.lift }), skinMat('#ffffff', { map: cos, rough: 0.7 }));
  }
  collect(m);
}

function dressAttendant(m) {
  const h = H.porcelain;
  const blue = skinMat('#2f6fd6', { rough: 0.6 });
  for (const head of headsOf(m)) {
    faceOn(m, head, h, atFace(), { rough: 0.2 });
    // a ticket booth cap: a dome sitting on the skull, and a brim on the front
    put(m, head, xf(ellipsoid(h.r * 1.1, h.r * 0.55, h.r * 1.12), { y: h.lift + h.r * 1.0 }), blue);
    put(m, head, xf(ellipsoid(h.r * 1.2, h.r * 0.07, h.r * 0.7), { y: h.lift + h.r * 0.8, z: h.r * 0.75 }), blue);
  }
  collect(m);
}

function dressBouncer(m) {
  const sk = boSkin(), to = boTorso();
  reskin(m, 'crawlskin', sk.map, sk.bump);
  reskin(m, 'crawltorso', to.map, to.bump);
  // extra eyes across the brow, in ball-pit orange
  const eye = glowMat('#ffb020');
  for (const head of headsOf(m)) {
    for (const [x, y, z] of [[-0.02, 0.05, 0.1], [0.02, 0.05, 0.1], [-0.052, 0.04, 0.094], [0.052, 0.04, 0.094]]) {
      put(m, head, xf(ellipsoid(0.011, 0.008, 0.006), { x, y: H.crawler.lift + y, z }), eye);
    }
  }
  collect(m);
}

function dressRingmaster(m) {
  reskin(m, 'howler', rmFace());
  const hat = skinMat('#101010', { rough: 0.35 });
  const band = skinMat('#d83a3a', { rough: 0.5 });
  for (const head of headsOf(m)) {
    const r = H.howler.r, top = H.howler.lift + r * 1.7;   // the top of the elongated skull
    put(m, head, xf(new THREE.CylinderGeometry(r * 0.62, r * 0.66, r * 1.1, 20), { y: top + r * 0.5 }), hat);
    put(m, head, xf(new THREE.CylinderGeometry(r * 0.67, r * 0.67, r * 0.18, 20), { y: top + r * 0.12 }), band);
    put(m, head, xf(new THREE.CylinderGeometry(r * 1.02, r * 1.02, r * 0.07, 24), { y: top + r * 0.02 }), hat);
  }
  collect(m);
}

// Each variant: a name for the model builder, the base creature it grows from, the
// mutate() options (heads / arms), an optional dress() that paints it, and the stats.
const variant = (id, base, build, def, voice, dress) => {
  const make = mutated(base, build);
  BUILDERS[id] = dress ? (rng) => { const m = make(rng); dress(m); return m; } : make;
  ENTITY_DEFS[id] = { ...ENTITY_DEFS[base], rare: false, pack: 'playground', voice, ...def };
  VOICES[id] = voice;
};

variant('pg_lifeguard', 'skinstealer', {}, {
  name: 'The Lifeguard', speed: 1.1, chase: 3.1, detect: 13, dmg: 30, reach: 1.55, cd: 1.3, memory: 7,
  num: 'Ω · Skin Stealer, in uniform', cls: 'Hostile', size: '~2.0 m',
  desc: 'A tall figure in a red and yellow lifeguard kit, a whistle round its neck. It is always watching the water. It has started watching you.',
  notes: 'Patrols the pools and slides and notices anyone who is out of the water when they should not be. Its whistle carries a long way, and what answers it is never another lifeguard.',
  tips: ['Do not stand still where it can see you.', 'The whistle means it has found you. Run.', 'It does not swim well. Deep water is safer than the deck.'],
}, 'shush', dressLifeguard);

variant('pg_mascot', 'stature', {}, {
  name: 'The Mascot', speed: 0.9, chase: 3.5, detect: 28, dmg: 45, reach: 2.4, cd: 1.8, memory: 10,
  num: 'Ω · The Stature, in costume', cls: 'Lethal', size: '3.4 m standing',
  desc: 'A towering pink and yellow figure in a smooth, smiling suit. There is no head under it. Nobody knows what it is mascot of.',
  notes: 'Frozen while watched and fast when not, like the Stature it is wearing. It waves. It is never, at any distance, waving at someone else.',
  tips: ['Wave back, and keep your eyes on it.', 'Back away without turning.', 'Low ceilings slow it.'],
}, 'chime', dressMascot);

variant('pg_attendant', 'mannequin', {}, {
  name: 'The Attendant', speed: 0, chase: 5.6, detect: 24, dmg: 30, reach: 1.4, cd: 1.1, memory: 45,
  num: 'Ω · Mannequin, on duty', cls: 'Hostile', size: '~1.8 m',
  desc: 'A ticket booth attendant in a blue cap and a pressed shirt, standing at the head of a queue that is not there. Its smile has been painted on.',
  notes: 'Moves only when unobserved, as every Mannequin does. It is found at ride entrances and always facing the way you are about to go.',
  tips: ['Keep it in view. Walk backwards if you have to.', 'Never turn your back on an empty ride entrance.'],
}, 'musicbox', dressAttendant);

variant('pg_bouncer', 'crawler', { arms: 2 }, {
  name: 'The Bouncer', speed: 1.4, chase: 6.3, detect: 14, dmg: 25, reach: 1.4, cd: 1.0, memory: 4,
  num: 'Ω · Crawler, in the ball pit', cls: 'Lethal', size: '~2 m across, six limbs',
  desc: 'A bright orange and purple thing that lives in ball pits and under trampolines. It bounces on four of its arms and reaches with the rest.',
  notes: 'Peeks, retreats when watched and then bursts in a single run, the way a Crawler does. Where it bounces the floor rings like a drum.',
  tips: ['Do not let it settle in your blind spot.', 'It cannot be outrun in the open. Be near a door.'],
}, 'giggle', dressBouncer);

variant('pg_ringmaster', 'howler', { heads: 1 }, {
  name: 'The Ringmaster', speed: 1.3, chase: 4.7, detect: 9, dmg: 30, reach: 1.55, cd: 1.2, memory: 4,
  num: 'Ω · Howler, ringside', cls: 'Hostile', size: '~2.1 m, two heads',
  desc: 'A Howler in a red coat and a top hat, with a second head wearing a smaller one. It announces everything it does.',
  notes: 'Hunts by sound like the original Howler. Both heads shout at once when it finds you, and every creature in earshot comes to see the show.',
  tips: ['Make no noise near a big top.', 'Once it has called, leave the area. Everything else heard it too.'],
}, 'call', dressRingmaster);

__mod['src/pack/playground-entities.js'] = {};
})();
