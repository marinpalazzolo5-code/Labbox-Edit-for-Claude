# Levels

Every level is one small file. The game reads the folders below at startup and
builds the level list out of them, so **editing a level file is all it takes** —
there is nothing to compile and nothing to paste into `index.html`.

```
levels/
  core.js        the tiny registry every level file talks to (do not edit)
  loader.js      loads core.js, packs.js and every level file (do not edit)
  packs.js       one entry per pack: name, blurb, and the list of level files
  base/          the base campaign        (31 levels)
  phobia/        The Phobia Wing          (44 levels + _pack.js)
  hell/          Hell                     (3 levels)
  corrupt/       Corruption               (30 levels)
  playground/    Playground               (30 levels + _pack.js)
```

A pack folder can also hold a `_pack.js` file with anything the pack's levels
need beyond the base game — furniture sets, item names, materials. Look at
`phobia/_pack.js` for an example.

## The fastest way in

* **Making a level:** open `other/level-studio.html` in a browser. Pick a preset,
  move the sliders, paint walls and place creatures on the *Map*, press *Play
  preview* to walk round it in the game straight away, then *Download*, drop the file in the pack folder and add its
  name to that pack's `files: [...]` list in `packs.js`. The studio prints the
  exact line to add.
* **Looking at a level's shape:** `node tools/levelcheck/cutcheck.mjs corrupt`
  prints a map of the holes in the floor of every Corruption level.
* **Checking a whole pack:** `node tools/levelcheck/check.mjs`.

## A level file

```js
LabLevels.add('base', {          // the folder this level belongs to
  id: 'level0',                  // short, unique, no spaces
  name: 'Level 0',
  subtitle: 'The Lobby',
  cls: 'Class 1',
  seed: 1001,                    // change this for a different layout
  description: 'One line for the level list.',
  intro: 'One or two lines shown when the level starts.',
  spawn: [16, 16],               // where the player starts, in metres
  ...
  gen: { type: 'lobby', params: { ... } },   // how the level is built
  stages: [ { text: 'Find the exit door', goal: 'door_exit', final: true } ],
  entities: [['weaver', 5]],     // who is in it: [id, how many]
  rare: [['crawler', 0.2]],      // rare spawns: [id, chance]
  loot: { keys: 7, water: 4, batteries: 2 },
});
```

Only `id`, `name`, `description`, `intro`, `seed`, `stages` and `gen` are
required. Everything else has a sensible default.

### Fields you will actually touch

| field | what it does |
| --- | --- |
| `name`, `subtitle`, `place` | what the level is called |
| `cls` | the class shown in the level list (`Class 1` … `Class ∞`) |
| `description` | the line under the name in the list |
| `intro` | the text on the loading screen |
| `seed` | every random choice in the level follows it — change it for a new layout |
| `spawn` | `[x, z]` start position in metres |
| `gen` | the generator (see below) |
| `stages` | what the player has to do (see below) |
| `entities`, `rare` | who is in the level, and who might be |
| `loot` | how much loot the level spawns |
| `fall` | `true` = falling off the level kills you instead of being rescued |
| `wet`, `wade` | wet floor look; `wade` = water depth in metres |
| `outdoor`, `dark`, `dayNight`, `ambience` | light and sky |
| `corrupt` | 0–1, how badly the level's "file" is damaged (Corruption pack) |
| `tuning` | `{ grimeScale, wetScale }` — how dirty/wet the materials look |

The other fields (`adrenaline`, `puzzle`, `cover`, `leviathan`, `fogBanks`,
`envLamps`, `surface`, `ambientLight`, `bounce`, `lightRange`, `fog`, `sky`,
`current`, `phobia`, `hum`, `flashes`, `passive`) are documented by the level
next to you: open any file in `levels/base/` and read the value.

### `gen`: how the level is built

| type | what it makes | main params |
| --- | --- | --- |
| `lobby` | indoor rooms and corridors, lamps, props, holes in the ceiling | `height`, `wallMat`, `floorMat`, `ceilMat`, `fixtureMat`, `frameMat`, `fixtureColor`, `fixtureIntensity`, `density`, `roomChance`, `pillarChance`, `doorwayChance`, `deadChance`, `flickerChance`, `strobeChance`, `dyingChance`, `darkZones`, `missingTileChance`, `props`, `corridor`, `flood`, `overgrown`, `cracked`, `damp`, `decals`, `featureWeights`, `allDark`, `cuts`, `layout`, `ceilingWalk` |
| `forest` | trees, bushes, a lamp or two | `treeChance`, `lampChance`, `leaves`, `floorMat` |
| `open` | one of the outdoor places | `mode` = `suburbs`, `city`, `field`, `cave`, `hills`, `courtyard`, `heights`, `lot`, `ocean`; `style`, `broken` |
| `open`, `mode: 'mall'` | a 3–6 storey mall round an atrium (see below) | `floors`, `fountain`, `storey` |
| `open`, `mode: 'apartment'` | a 3–6 storey block of flats round a light well | `floors`, `fountain`, `storey` |
| `open`, `mode: 'stairwell'` | nothing but the stairwell: the level is one long climb | — (the stairs come from the stage, see below) |

#### Malls and apartment blocks (`mode: 'mall'` / `'apartment'`)

A real building stands at x, z from 0 to 64 m (a mall) or 48 m (flats), with a
car park round it you can see through the windows. Shops (or flats) line the
outside walls; a gallery runs round the atrium on every floor behind a glass
railing; escalators that really run (or, in the flats, stairs) climb across the
atrium from floor to floor; a fountain at the bottom (`fountain: false` for
none) and a skylight on top. Empty shelves and racks in the shops, beds and sofas
in the flats, posters on the piers, palms and benches round the atrium.

* `floors`: 3–6 (mall 4, apartment 5); `storey`: metres per floor (4.5 / 3.2).
* put the `spawn` on the ground-floor gallery: `[16.5, 30]` in a mall, `[11, 24]`
  in a block of flats.
* give a stage `floor: n` (0 = ground) to put its target on that floor: wall goals
  hang on the shop piers or, for doors and elevators, on the outside wall inside
  a shop; everything else stands inside a shop.
* creatures live on floors too: they fall through the atrium, take the stairs to
  your floor when you are out of sight, and cannot reach you through a floor.

`levels/base/12-level20-the-mall.js` (ride up, fetch the key, come back down) and
`levels/playground/omega-23-the-elevator-atrium.js` are examples.

#### Painted maps (`layout`) and walking on the ceiling (`ceilingWalk`)

`gen.params.layout` is the map painted in the level studio: one string per row
of 2 m cells from the world origin (row = z cell, column = x cell). `#` is a
block of wall, `.` (or `S`) is open floor, `?` lets the generator decide. Only
the `lobby` generator reads it.

`gen.params.ceilingWalk: true` (lobby) is for corrupted levels: by the spawn the
ceiling has fallen in over a heap of rubble you can climb, the top of the ceiling
holds your weight, nothing below can follow you up, and a roof hatch somewhere up
there is a shortcut out of the level. Δ-01, Δ-06 and Δ-23 have it.

Material names (`wallMat`, `props`, …) are the ones in `other/level-studio.html`'s
dropdowns — the studio only offers names that exist.

### furniture sets (`props`)

`props` is the name of a furniture set. The base game ships fifteen of them
(`lobby`, `industrial`, `office`, `hotel`, `party`, `museum`, `hospital`,
`school`, `garage`, `pool`, `snack`, `sewer`, `mall`, `void`, `red`); a pack can
add its own in `_pack.js` — `levels/playground/_pack.js` has a set per level, and
`levels/phobia/_pack.js` has a couple more.

A set has three lists. All three are optional but a set with no `wall` and no
`floor` does nothing:

```js
props: {
  my_set: {
    // [type, chance per wall slot, y, opts] — against a wall, on the floor
    wall: [['C:locker', 0.03, 0, { mat: 'metal_blue' }], ['bunting', 0.2]],
    // [type, [min, max], opts, y] — in a random open cell
    floor: [['chain_plastic', [1, 3]], ['log_boat', [2, 4], null, 0.42]],
    // [type, [min, max], opts] — a whole block of open cells, nothing else in it
    big: [['carousel', [1, 1]], ['escalator', [2, 3], { len: 5.6, rise: 2.6 }]],
  },
},
```

`big` is for the rides and other set pieces: the entry is placed in the smallest
block of open cells its footprint fits in, with nothing already standing in it,
so a carousel lands in the middle of a court instead of inside a wall. Pass
`opts.len` to place a shorter piece of a long prop (a 1.8 m section of
rollercoaster rail fits on a catwalk; 4 m does not). `C:` in front of a name
means a container (something with a drawer) instead of a prop.

The Playground rides are ordinary props with these names: `turnstile`,
`balloon_bunch`, `ball_pit`, `ball_pile`, `arcade_cabinet`, `pinball_table`,
`carousel`, `trampoline`, `escalator`, `mirror_panel`, `warp_mirror`,
`glass_lift`, `cake_table`, `candy_tree`, `log_boat`, `bumper_car`, `go_kart`,
`coaster_rail`, `pylon`, `cable_car`, `parade_float`, `bunting`, `glow_ghost`,
`costume_rack`, `costume_head`, `snow_drift`, `ice_slide`, `palm_tree`,
`wave_machine`, `fountain`, `speaker_pole`.

### `stages`: what to do

Each stage is one objective. `goal` is the thing to reach or use
(`door_exit`, `stairs`, `stairshaft`, `escalator`, `slide`, `generator`, `valve`, `lantern`,
`medkit`, `elevator`, `keypad`, `hatch`, `cake`, `musicbox`, `terminal`, `bell`,
`breaker`, `artifact`, `anchor`, `note`, `vending`, `portal_window`, and the
doors). Useful keys:

```js
{ text: 'Take the stairwell to the midway', goal: 'stairshaft',
  flights: 6, rise: 2.8,          // how many flights, how tall each is
  dist: [40, 60],                 // how far from the spawn it may be, in metres
  final: true }                   // the last stage of the level
```

| key | meaning |
| --- | --- |
| `text` | the objective line in the HUD |
| `goal` | what to reach (see the list above) |
| `item`, `count` | collect `count` of `item` instead |
| `dist: [min, max]` | how far from the spawn the target may be placed |
| `final` | this stage finishes the level |
| `from: 'prev'`, `reuse` | place this target at the previous stage's target |
| `survive`, `rideTime`, `pickSafe`, `order`, `code`, `corridor` | special stage types — copy one from an existing level |
| `effects` | things that happen at the stage: `alarm`, `message`, `night`, `powercut`, `rage`, `spawn` |
| `floor` | in a mall / apartment level: which floor the target is on (0 = ground) |
| `checkpoint` | transports (elevator, stairs, stairwell, escalator, slide, hatch) are respawn checkpoints once used; `false` turns that off |
| `next` | on the final stage of a transport: carry the player straight into the level with this id |
| `atSpawn`, `exits` | stairwell levels: put the shaft round the spawn; `exits: [8, 12]` puts a door on those landings |
| `endings`, `clue` | slides: which bad endings the wrong slides may have, and which clue the note gives (`mark`, `noface`, `arrows`) |

A level whose last stage is not `final: true` never ends — the studio warns about
this.

#### Staged levels and checkpoints

Stages make a level a sequence: ride the escalators up, take the key, come back
down to the exit. Using a transport (an elevator, the stairs, a stairwell, an
escalator goal, a slide that let you live) sets a checkpoint, and so do stepping
off a mall escalator onto a new floor and passing a stairwell landing with a door
(or every fourth landing): if you die, you come back there, not at the spawn.
A final stage with `next: 'pg11'` carries you straight on into that level.

#### Slides

A slide is only its mouth: a moulded plastic tube end standing out of a wall,
sprayed round with tags, arrows and entity faces. With `pickSafe: true` and
`count: 4` one of the row lets you live; a clue note near where the stage starts
says which (the symbol over the hole, the only one without a face, or how many
arrows point at it) - everything else painted there is a distraction. Inside, the
tube is shiny striped plastic: daylight from the mouth fades within seconds and
the flashlight is the only light. The safe slide ends at an exit door, a lobby
or a hatch; the others end in a giant mouth, a grinder, a whirlpool or a drop
(`endings: ['jaws', 'grinder']` picks which).

#### Stairwell levels

```js
gen: { type: 'open', mode: 'stairwell', params: {} },
stages: [{ text: 'Climb the stairwell', goal: 'stairshaft', flights: 16, rise: 2.8,
           exits: [8, 12], atSpawn: true, dist: [0, 0], final: true }],
follower: { type: 'pg_ringmaster', delay: 10 },
```

No maze: the level starts at the sealed foot of one long stairwell. A door on a
landing in `exits` is a floor to get off at (it ends the level too), and
`follower` is something that climbs exactly where you climbed, `delay` seconds
behind - stand still and it closes the gap.

### `entities` and `rare`

```js
entities: [['smiler', 4], ['partygoer', 6]],   // [id, how many]
rare: [['crawler', 0.2]],                      // [id, chance per spawn point]
entities: [['chase', 1, { delay: 2.5 }]],      // [id, how many, options] - options are
                                               // for special creatures; copy one that works
```

The ids are the files in `entities/<pack>/` without the `.js` (`entities/base/smiler.js`
→ `'smiler'`). Creatures in `entities/base/` can go in any level; a creature in a
pack's own folder (`entities/playground/`, `entities/phobia/`, ...) only in that
pack's levels - `tools/levelcheck/check.mjs` and the level studio both enforce it.
Add your own with `other/entity-studio.html`.

```js
placed: [['smiler', 17, 17]],                  // fixed spots in metres (the studio's map)
follower: { type: 'chase', delay: 8 },         // walks your own footsteps, delay seconds behind
```

## Holes in the floor: `cuts`

`gen.params.cuts` is an array of holes. A level with cuts should set `fall: true`
so the drop kills. Four kinds:

```js
cuts: [
  // a wide trench, torn in whole cells, with bridges of solid rock across it
  { kind: 'canyon',  axis: 'x', mid: 8, length: 64, offset: -22, width: 5, wobble: 10,
    bridges: 2, bridgeSpan: 4, jag: 3 },
  // one or more long narrow slits
  { kind: 'crevice', axis: 'z', mid: 8, length: 56, offset: 24, runs: 2, spacing: 18,
    width: 1.1, wobble: 9 },
  // a rectangular piece of the level cut straight out
  { kind: 'block',   x: 18, z: -14, w: 9, h: 10, shards: 0.12 },
  // the original single tear, still accepted under gen.params.cliff:
  { kind: 'rift',    axis: 'x', mid: 8, length: 56, offset: -20, width: 2.4, wobble: 9 },
]
```

* coordinates are grid cells (one cell = 2 m) and are measured from the level
  origin — check where your `spawn` is before you place one (`spawn: [16,16]` is
  about cell `(8, 8)`, so a cut at `mid: 8, offset: 0` would swallow it);
* `axis` is the direction the cut runs; `mid` is the cell it is centred on along
  that axis, `offset` how far off the origin it lies across it;
* `width` how wide it opens, `wobble` how far the edge wanders;
* a canyon is crossable at `bridges` even intervals, so the far side is always
  reachable on foot. Without bridges, the only way across is the long way round;
* the water of a flooded level runs away into a cut instead of floating over it,
  and the edges get a broken lip and slabs hanging in the hole.

Cuts are built by the `lobby` and `forest` generators. An `open` level has no
floor of its own, so it ignores them - the studio says so when you build one.

Run `node tools/levelcheck/cutcheck.mjs corrupt` to see every cut drawn on a map,
how much of the play area it takes, and how close it comes to the spawn.

## Adding a level

1. Put `my-level.js` in the pack folder (the studio's *Download* button, or copy
   a level that is like yours and edit it). Give it an id of its own - the studio
   says so if the id is already taken, because two levels with one id means the
   second one can never be reached.
2. Add its file name to that pack's `files: [...]` list in `levels/packs.js`.
   The studio prints the whole new list under *Step 2, done for you*, so you can
   paste over the old one instead of hunting for the right line.
3. Reload the game. The loader reports a file that is listed but missing, a pack
   whose file count does not add up, and (in the console) a level file that does
   not parse - a level that never appears is nearly always one of those.

## Adding a pack

1. Make the folder, put the level files in it.
2. Copy the `LabLevels.pack({ ... })` block of another pack in `levels/packs.js`,
   change `folder` to the new folder name and list the files. `bonus: true` packs
   are installed from the pack dock on the start screen; `builtin: true` is
   always installed. Give it a `name`, a `tab` and a `blurb`.
3. Reload the game. The studio prints a ready-made pack block.

## Heads up: regenerated packs

The Corruption and Playground packs were rebuilt from the original game by
`tools/levelcheck/regen.mjs`, which **overwrites every file in those folders**.
If you hand-edit a Corruption or Playground level, keep your own copy: the
generator's inputs (cut shapes, glitch amounts, rewritten text) live in
`tools/levelcheck/data/*.json`.
