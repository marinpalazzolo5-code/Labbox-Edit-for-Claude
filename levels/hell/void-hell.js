// --------------------------------------------------------------------------
// Void of Hate  (id: void-hell, Hell)
// A thin forest on the lip of two canyons with no bottom. Colossi walk the far side.
//
// Rebuilt from the look the level studio recorded for it.
// --------------------------------------------------------------------------
LabLevels.add('hell', {
  id: 'void-hell',
  name: 'Void of Hate',
  subtitle: 'Void of Hate',
  cls: 'Class 3',
  seed: 6663,
  description: 'Two bottomless canyons torn through a dead forest. Cross on the bridges.',
  intro: 'The ground ends in nothing. Find a bridge, and do not look down.',
  spawn: [16, 16],
  outdoor: true,
  fall: true,
  corrupt: 0.15,
  hum: 0.012,
  ambientLight: [0.25, 0.25, 0.25],
  bounce: 0.34,
  fog: { color: 0x436165, density: 0.004 },
  gen: {
    type: 'forest',
    params: {
      treeChance: 0.04,
      lampChance: 0.04,
      cuts: [
        { kind: 'canyon', axis: 'x', mid: 19, length: 60, offset: 24, width: 12, wobble: 10, bridges: 2, bridgeSpan: 4, jag: 8 },
        { kind: 'canyon', axis: 'x', mid: 8, length: 500, offset: 24, width: 12, wobble: 10, bridges: 7, bridgeSpan: 4, jag: 3 },
      ],
    },
  },
  stages: [
    { text: 'Find the hatch out of the void', goal: 'hatch', dist: [60, 90], final: true },
  ],
  entities: [['colossus', 4], ['shade', 20]],
  rare: [],
  loot: { keys: 9, water: 5, batteries: 3 },
});
