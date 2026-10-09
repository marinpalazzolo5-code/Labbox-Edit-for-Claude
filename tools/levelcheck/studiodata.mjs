// Refresh the level studio's copy of the levels: the "Copy the look of an existing
// level" list (GAME.looks), the ids that are taken (GAME.takenIds) and each pack's
// file list (GAME.packFiles) are read out of levels/ and written into the GAME block
// of other/level-studio.html. Run it after adding or changing a level:
//
//   node tools/levelcheck/studiodata.mjs
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './bundle.mjs';
import { readLevel } from './levelio.mjs';

const studioFile = path.join(ROOT, 'other/level-studio.html');
const html = fs.readFileSync(studioFile, 'utf8');
const start = html.indexOf('const GAME = ') + 'const GAME = '.length;
const end = html.indexOf(';\n', start);
const GAME = JSON.parse(html.slice(start, end));

// the pack list, the way the game reads it
const packs = [];
new Function('LabLevels', fs.readFileSync(path.join(ROOT, 'levels/packs.js'), 'utf8'))({ pack: (p) => packs.push(p) });

// fields a look carries itself; everything else that describes the place goes in `extra`
const OWN = new Set(['id', 'name', 'subtitle', 'place', 'cls', 'seed', 'description', 'intro', 'gen', 'stages', 'entities', 'rare', 'loot', 'placed', 'follower', 'spawn']);
const looks = [], taken = [], packFiles = {};
for (const p of packs) {
  const folder = p.folder || p.id;
  packFiles[folder] = (p.files || []).slice();
  for (const f of p.files || []) {
    if (f === '_pack.js') continue;
    const file = path.join(ROOT, 'levels', folder, f);
    if (!fs.existsSync(file)) continue;
    const { def } = readLevel(file);
    taken.push(def.id);
    const extra = {};
    for (const k of Object.keys(def)) if (!OWN.has(k)) extra[k] = def[k];
    const look = { pack: folder, name: def.name, subtitle: def.subtitle, cls: def.cls, gen: def.gen, extra, entities: def.entities || [], rare: def.rare || [], loot: def.loot };
    const cuts = def.gen && def.gen.params && def.gen.params.cuts;
    if (cuts) look.cuts = cuts;
    if (def.placed) look.placed = def.placed;
    if (def.gen && def.gen.params && def.gen.params.layout) look.spawn = def.spawn;
    looks.push(JSON.parse(JSON.stringify(look)));
  }
}
GAME.looks = looks;
GAME.takenIds = taken.sort();
GAME.packFiles = packFiles;
fs.writeFileSync(studioFile, html.slice(0, start) + JSON.stringify(GAME) + html.slice(end));
console.log(`level studio: ${looks.length} looks, ${taken.length} ids, ${Object.keys(packFiles).length} packs`);
