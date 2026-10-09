# Entities

Every creature in Labyrinth Box is one file, in a folder named after the level pack it
belongs to:

```
entities/
  loader.js      the load order of every file below (and the pack map, see the end)
  core/          shared building blocks - no creatures
  base/          creatures ANY level may use, in any pack, custom levels included
  phobia/        The Phobia Wing only          (the D.<id> entries)
  corruption/    Corruption only               (levels/corrupt/, pack id 'corruption')
  playground/    Playground only               (playground.js holds all five pg_* variants)
```

## The rule

* A creature in **`base/`** can be used by every level (`entities`, `rare`, `placed`, and
  the `spawn` stage effect).
* A creature in a **pack folder** can only be used by the levels of that pack:
  `phobia/` by `levels/phobia/`, `corruption/` by `levels/corrupt/`, `playground/` by
  `levels/playground/`. The campaign (`levels/base/`, pack id `main`) can only use `base/`.
* The entity folder of a pack is its pack id (`main` -> `base`), so a new pack `hell` would get
  `entities/hell/`.

`tools/levelcheck/check.mjs` reports a level that breaks the rule, and
`other/level-studio.html` only offers the creatures a level's pack may use.

When a pack creature turns out to be wanted by another pack, move it to `base/` (`git mv`, then
change its folder in `loader.js` - keep its place in the list). That is how these ended up there:

* `jester`, `updraft`, `frostbitten`, `rootwalker` (Phobia Wing) and `mut_drowned` (Corruption):
  Playground levels use them;
* `bleeder`, `colossus` (Phobia Wing): the Hell levels use them;
* `demon`, `shadow`, `gremlin`, `shade` (made with the entity studio): the Hell levels use them, and
  they belong to no other pack.

## A creature file

Each file holds, in order:

1. **Private helpers** - the textures / faces / small functions only that creature uses.
2. **The model builder** (`buildXxx`) - the three.js skeleton, skin, face and `animate(st, dt)`.
3. **Registration** - `BUILDERS.<id> = buildXxx` (how the game finds the model).
4. **Stats & behaviour** - `ENTITY_DEFS.<id>` (core entities) or `D.<id>` (Phobia Wing style):
   name, speed / chase speed, senses, damage, field-guide text and, for `D.<id>`, the AI hooks.

Edit a file, then reload `other/entity-viewer.html` (it remembers the selected entity) or the game.

## Shared building blocks - `core/`

| file | what it is |
| --- | --- |
| `registry.js` | the two shared tables, `BUILDERS` and `ENTITY_DEFS` |
| `rig.js` | skeleton + skinned-mesh construction, materials, walk/crawl/spider animators |
| `models-kit.js` | skin / cloth texture painters, body builder, `buildModel()` |
| `phobia-kit-a.js`, `phobia-kit-b.js` | helpers shared by several Phobia Wing models (eyes, halos, chains, smoke...) |
| `phobia-ai.js` | the `D` table and the helpers shared by the `D.<id>` AI hooks (`hunt`, `lunge`, `strike`, ...) |
| `phobia-finish.js` | runs after every `D.<id>` file: copies `D` into `ENTITY_DEFS` and builds the voice table |
| `mutate.js` | `mutated(baseId, options)`: the model builder of the bonus-pack variants |

`D.<id>` entries are not tied to the phobia folder: `base/jester.js` is one. What matters is
that every `D.<id>` file loads before `core/phobia-finish.js`.

## Adding a new entity to a pack

1. Copy the entity file closest to what you want into the pack's folder and rename it `<id>.js`
   (`entities/base/hall-thing.js` for a creature every level may use). The file name has to
   match the id: the entity viewer prints the file in its error boxes.
2. Change the id in the `BUILDERS.<id>` line and in the `ENTITY_DEFS.<id>` / `D.<id>` line.
3. Add `'<folder>/<id>.js'` to the list in `loader.js` - before `core/phobia-finish.js` for an
   ordinary creature or a `D.<id>` entry, after `core/mutate.js` for a `mutated()` variant.
   Nothing loads a file that is not in that list, so no tool and no pack can see the creature yet.
4. That is all: the level studio's pick lists, `check.mjs`, the entity viewer and the field guide all
   read what `loader.js` loaded. `other/entity-studio.html` writes steps 1-3 for you (pick the pack
   there) and its wiring check lists every creature that loaded, by pack.

Scripts are plain `<script>` tags (no modules), so everything works when opened straight from disk.

## Bonus-pack variants

`corruption/*.js` (one file per `mut_*` creature), `base/mut_drowned.js` and `playground/playground.js`
hold creatures that are *variants* of existing ones. Each one is a `mutated(baseId, options)` model
builder (`core/mutate.js`: extra heads / arms / legs, stretched limbs, tints, glitch jitter) plus an
`ENTITY_DEFS` entry copied from the base creature, so it keeps the base's behaviour flags (`watcher`,
`crawler`, `statue`, `howl`, `darkOnly`, ...). They load after `core/phobia-finish.js`. Copy one
`corruption/mut_*.js` file for a new Corruption variant; the five Playground variants share their
painted-texture helpers, so they stay together in `playground/playground.js` - add a new one with the
`variant(id, base, build, def, voice, dress)` helper there.

## The pack map at runtime

`loader.js` writes a tiny inline script after every file tag that diffs the keys of `BUILDERS`,
`ENTITY_DEFS` and `D`: whatever a file added is credited to that file's folder. After loading:

```js
LabEntities.packOf.smiler           // 'base'
LabEntities.packOf.pg_mascot        // 'playground'
LabEntities.files.mut_chorus        // 'corruption/mut_chorus.js'
LabEntities.ids()                   // every creature id, in load order
LabEntities.allowed('weaver', 'corrupt')   // false: a Corruption level cannot use a Phobia creature
LabEntities.folderOf('main')        // 'base'  (pack id or levels/ folder -> entity folder)
```
