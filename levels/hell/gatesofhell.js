// --------------------------------------------------------------------------
// Gates of Hell - Hells Gate  (id: gatesofhell, Hell)
// Red-lit marble halls behind the gate, full of things that answered the Howler.
//
// Rebuilt from the look the level studio recorded for it (the file itself was
// missing from levels/hell/). Stages: break the seals, then the gate opens.
// --------------------------------------------------------------------------
LabLevels.add('hell', {
  id: 'gatesofhell',
  name: 'Gates of Hell',
  subtitle: 'Hells Gate',
  cls: 'Class 4',
  seed: 6661,
  description: 'Tall red halls behind the gate. The demons came when the Howler called.',
  intro: 'The gate shut behind you. Somewhere in these halls are the seals that hold it closed.',
  spawn: [16, 16],
  hum: 0.012,
  ambientLight: [0.12, 0.12, 0.12],
  bounce: 0.34,
  fog: { color: 0x6d5754, density: 0.06 },
  gen: {
    type: 'lobby',
    params: {
      height: 4,
      wallMat: 'plaster_hospital',
      floorMat: 'paving',
      ceilMat: 'metal_red',
      fixtureMat: 'clay_red',
      frameMat: 'gold',
      fixtureColor: [1, 0.94, 0.78],
      fixtureIntensity: 4.6,
      fixtureEvery: 2,
      fixtureChance: 0.92,
      deadChance: 0.05,
      flickerChance: 0.05,
      strobeChance: 0.012,
      dyingChance: 0.065,
      darkZones: 0.25,
      density: [0.22, 0.62],
      roomChance: 0.5,
      pillarChance: 0.4,
      doorwayChance: 0.12,
      missingTileChance: 0.02,
      decals: 1,
      props: 'red',
    },
  },
  stages: [
    { text: 'Break the three seals', goal: 'lantern', count: 3, dist: [24, 48] },
    { text: 'The gate is open. Get out', goal: 'door_final', dist: [40, 60], from: 'prev', final: true,
      effects: [['message', 'Something howls. They know the gate is open.'], ['alarm']] },
  ],
  entities: [['duller', 2], ['howler', 6], ['demon', 6], ['shade', 8], ['gremlin', 12]],
  rare: [['bleeder', 0.5]],
  loot: { keys: 20, water: 8, batteries: 4 },
});
