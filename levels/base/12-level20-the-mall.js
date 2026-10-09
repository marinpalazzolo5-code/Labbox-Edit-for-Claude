// --------------------------------------------------------------------------
// Level 8.2 - The Mall  (id: level20, Base campaign)
// Shuttered storefronts, planters and a fountain that stopped long ago.
//
// Scene: a four-storey mall round an atrium, 4 entity groups, 2 rare spawns, loot keys 10/water 5/batteries 3
//    1. Ride the escalators up, shut off the alarm panels  [breaker x2, floor 3]
//    2. Take the security key  [artifact, floor 2]
//    3. Go back down and leave  [door_shutter (final), floor 0]
//
// One level per file: change anything here and reload the game. Field list:
// levels/README.md  -  build levels without code: other/level-studio.html
// --------------------------------------------------------------------------
LabLevels.add('base', {
  id: 'level20',
  name: 'Level 8.2',
  subtitle: 'The Mall',
  cls: 'Class 2',
  seed: 3021,
  description: 'Four floors of empty shops round an atrium. The escalators still run; the fountain never stopped.',
  intro: 'The alarm panels are on the top floor. Ride up, shut them off, find the key, and come back down to the exit.',
  spawn: [16.5, 30],
  ambientLight: [0.035, 0.034, 0.032],
  bounce: 0.36,
  lightRange: 22,
  fog: { color: 0x1f1d19, density: 0.02 },
  tuning: { grimeScale: 0.9, wetScale: 0.6 },
  gen: {
    type: 'open',
    mode: 'mall',
    params: {
      floors: 4,
      fountain: true,
    },
  },
  stages: [
    {
      text: 'Ride the escalators to the top floor and shut off the alarm panels',
      hint: 'Fourth floor. The escalators still run.',
      goal: 'breaker',
      count: 2,
      floor: 3,
      dist: [10, 30],
    },
    {
      text: 'Take the security key from the manager\'s office',
      goal: 'artifact',
      floor: 2,
      dist: [10, 30],
      from: 'prev',
    },
    {
      text: 'Go back down and leave through the mall exit',
      goal: 'door_shutter',
      floor: 0,
      dist: [20, 40],
      final: true,
    },
  ],
  entities: [['mannequin', 4], ['hound', 1], ['partygoer', 1], ['deathmoth', 1]],
  rare: [['stature', 0.35], ['crawler', 0.2]],
  loot: { keys: 10, water: 5, batteries: 3 },
});
