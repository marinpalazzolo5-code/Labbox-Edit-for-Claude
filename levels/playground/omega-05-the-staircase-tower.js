// --------------------------------------------------------------------------
// Ω-05 - The Staircase Tower  (id: pg05, Playground)
// A narrow stairwell the colour of boiled sweets, eight floors in a single shaft. No rooms, no corridors: the stairs are the level, and something climbs them behind you.
//
// Scene: the level is one stairwell (8 flights), with a follower on the stairs
//    1. Climb the stairwell  [stairshaft at the spawn (final)]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('playground', {
  id: 'pg05',
  name: 'Ω-05',
  subtitle: 'The Staircase Tower',
  place: 'Eight floors, no lift',
  cls: 'Class 3',
  seed: 9235,
  description: 'A narrow stairwell the colour of boiled sweets, eight floors in a single shaft. No rooms, no corridors: the stairs are the level, and something climbs them behind you.',
  intro: 'You start at the bottom of the shaft. Eight flights to the door at the top. Something is coming up the stairs after you - keep moving.',
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
      flights: 8,
      rise: 2.8,
      atSpawn: true,
      dist: [0, 0],
      final: true,
    },
  ],
  follower: { type: 'pg_attendant', delay: 9 },
  entities: [],
  rare: [],
  loot: { keys: 10, water: 5, batteries: 3 },
});
