// --------------------------------------------------------------------------
// Ω-10 - The Escalator Atrium  (id: pg10, Playground)
// Six storeys of mall round one atrium, and every escalator still runs - up. The service stairs on the sixth floor are the way on, into the mirror maze.
//
// Scene: a six-storey mall round an atrium with running escalators, 2 entity groups, 1 rare spawn
//    1. Wind the music box  [musicbox, floor 2]
//    2. The service stairs  [door_stairs (final), floor 5, carries on into pg11]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('playground', {
  id: 'pg10',
  name: 'Ω-10',
  subtitle: 'The Escalator Atrium',
  place: 'Going up',
  cls: 'Class 3',
  seed: 9470,
  description: 'Six storeys of mall round one atrium, and every escalator still runs - up. The service stairs on the sixth floor are the way on, into the mirror maze.',
  intro: 'Ride the escalators up through the atrium. Wind the music box on the third floor, then find the service stairs on the sixth. They lead straight down into the next ride.',
  spawn: [16.5, 30],
  hum: 0.01,
  ambientLight: [0.1, 0.09, 0.1],
  bounce: 0.4,
  lightRange: 20,
  fog: { color: 0xf2dce8, density: 0.016 },
  tuning: { grimeScale: 0.1, wetScale: 0.3 },
  gen: {
    type: 'open',
    mode: 'mall',
    params: {
      floors: 6,
      fountain: true,
    },
  },
  stages: [
    {
      text: 'Ride the escalators to the third floor and switch the music back on',
      hint: 'Every escalator still runs. They only go up.',
      goal: 'musicbox',
      floor: 2,
      dist: [10, 30],
    },
    {
      text: 'Keep going up: the service stairs are on the sixth floor',
      goal: 'door_stairs',
      floor: 5,
      dist: [10, 40],
      from: 'prev',
      final: true,
      next: 'pg11',
    },
  ],
  entities: [['mannequin', 3], ['partygoer', 1]],
  rare: [['pg_attendant', 0.4]],
  loot: { keys: 10, water: 5, batteries: 3 },
});
