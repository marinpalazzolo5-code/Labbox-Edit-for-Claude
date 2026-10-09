// --------------------------------------------------------------------------
// Ω-23 - The Elevator Atrium  (id: pg23, Playground)
// A five-storey block of flats round a light well, the lift lobby on every floor, and each lift with a bright little jingle.
//
// Scene: a five-storey apartment block round a light well, 2 entity groups, 1 rare spawn
//    1. Call the lifts  [elevator x2, floor 0]
//    2. The freight elevator  [elevator (final), floor 4, carries on into pg24]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('playground', {
  id: 'pg23',
  name: 'Ω-23',
  subtitle: 'The Elevator Atrium',
  place: 'Doors closing',
  cls: 'Class 3',
  seed: 10081,
  description: 'A five-storey block of flats round a light well, the lift lobby on every floor, and each lift with a bright little jingle.',
  intro: 'Call the lifts in the lobby. Then climb the stairs across the light well to the fifth floor, where the freight elevator takes you down to the log flume.',
  spawn: [11, 24],
  hum: 0.01,
  ambientLight: [0.1, 0.09, 0.1],
  bounce: 0.4,
  lightRange: 20,
  fog: { color: 0xf2dce8, density: 0.016 },
  tuning: { grimeScale: 0.1, wetScale: 0.3 },
  gen: {
    type: 'open',
    mode: 'apartment',
    params: {
      floors: 5,
      fountain: false,
    },
  },
  stages: [
    { text: 'Call the lifts in the lobby', goal: 'elevator', count: 2, floor: 0, dist: [10, 30] },
    {
      text: 'Climb to the top floor and take the freight elevator down',
      hint: 'The stairs cross the light well on every floor.',
      goal: 'elevator',
      floor: 4,
      dist: [10, 30],
      from: 'prev',
      final: true,
      next: 'pg24',
    },
  ],
  entities: [['pg_attendant', 2], ['partygoer', 1]],
  rare: [['pg_mascot', 0.4]],
  loot: { keys: 10, water: 5, batteries: 3 },
});
