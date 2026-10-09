// --------------------------------------------------------------------------
// Ω-27 - Stairs to the Moon  (id: pg27, Playground)
// A stairwell tower that goes on past any building: sixteen flights in one narrow shaft. Two landings have a door; the ringmaster follows every step you take.
//
// Scene: the level is one stairwell (16 flights, exits on landings 8, 12), with a follower on the stairs
//    1. Climb the stairwell  [stairshaft at the spawn (final)]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('playground', {
  id: 'pg27',
  name: 'Ω-27',
  subtitle: 'Stairs to the Moon',
  place: 'Sixteen flights',
  cls: 'Class 5',
  seed: 10269,
  description: 'A stairwell tower that goes on past any building: sixteen flights in one narrow shaft. Two landings have a door; the ringmaster follows every step you take.',
  intro: 'Sixteen flights in one narrow shaft. There are doors on the 9th and 13th floors if you cannot make the top. Do not look down. Something is following you up.',
  spawn: [16, 16],
  hum: 0.01,
  ambientLight: [0.08, 0.08, 0.14],
  bounce: 0.4,
  lightRange: 20,
  fog: { color: 0x8a90c0, density: 0.022 },
  tuning: { grimeScale: 0.1, wetScale: 0.3 },
  gen: { type: 'open', mode: 'stairwell', params: {} },
  stages: [
    {
      text: 'Climb the stairwell',
      hint: 'Keep moving: it gains on you while you stand still',
      goal: 'stairshaft',
      flights: 16,
      rise: 2.8,
      exits: [8, 12],
      atSpawn: true,
      dist: [0, 0],
      final: true,
    },
  ],
  follower: { type: 'pg_ringmaster', delay: 10 },
  entities: [],
  rare: [],
  loot: { keys: 10, water: 5, batteries: 3 },
});
