// --------------------------------------------------------------------------
// Fields of Suffering - Fields of Pain  (id: fieldsofhell, Hell)
// Open fields under a red haze, with the shades standing in the wheat.
//
// Rebuilt from the look the level studio recorded for it.
// --------------------------------------------------------------------------
LabLevels.add('hell', {
  id: 'fieldsofhell',
  name: 'Fields of Suffering',
  subtitle: 'Fields of Pain',
  cls: 'Class 5',
  seed: 6662,
  description: 'Wide fields under a red haze. The shades stand in the wheat and watch.',
  intro: 'Open ground in every direction. Find the cabin before the big one finds you.',
  spawn: [16, 16],
  outdoor: true,
  hum: 0.012,
  ambientLight: [0.16, 0.16, 0.16],
  bounce: 0.34,
  fog: { color: 0x564355, density: 0.02 },
  gen: { type: 'open', mode: 'field', params: {} },
  stages: [
    { text: 'Light the lantern by the road', goal: 'lantern', dist: [30, 50] },
    { text: 'Reach the cabin', goal: 'cabin', dist: [50, 80], from: 'prev', final: true },
  ],
  entities: [['shade', 18], ['shadow', 2], ['demon', 2], ['wretch', 4]],
  rare: [['colossus', 0.6]],
  loot: { keys: 6, water: 5, batteries: 3 },
});
