// --------------------------------------------------------------------------
// Ω-16 - The Great Staircase  (id: pg16, Playground)
// One great stairwell in candy-cane stripes: twelve flights in a single narrow shaft, and a door on the sixth landing for anyone who cannot face the rest.
//
// Scene: the level is one stairwell (12 flights, exits on landings 6), with a follower on the stairs
//    1. Climb the stairwell  [stairshaft at the spawn (final)]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('playground', {
  id: 'pg16',
  name: 'Ω-16',
  subtitle: 'The Great Staircase',
  place: 'Twelve flights',
  cls: 'Class 4',
  seed: 9752,
  description: 'One great stairwell in candy-cane stripes: twelve flights in a single narrow shaft, and a door on the sixth landing for anyone who cannot face the rest.',
  intro: 'Twelve flights, or six and the door on floor 7. The mascot is climbing too, a few seconds behind you. Do not stop to count the floors.',
  spawn: [16, 16],
  hum: 0.01,
  ambientLight: [0.1, 0.09, 0.1],
  bounce: 0.4,
  lightRange: 20,
  fog: { color: 0xf2dce8, density: 0.016 },
  tuning: { grimeScale: 0.1, wetScale: 0.3 },
  gen: { type: 'open', mode: 'stairwell', params: {} },
  stages: [
    {
      text: 'Climb the stairwell',
      hint: 'Keep moving: it gains on you while you stand still',
      goal: 'stairshaft',
      flights: 12,
      rise: 2.8,
      exits: [6],
      atSpawn: true,
      dist: [0, 0],
      final: true,
    },
  ],
  follower: { type: 'pg_mascot', delay: 8 },
  entities: [],
  rare: [],
  loot: { keys: 10, water: 5, batteries: 3 },
});
