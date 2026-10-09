# Entities

Every creature in Labyrinth Box is one file in this folder (`smiler.js`, `weaver.js`, ...).
Each file holds, in order:

1. **Private helpers** - the textures / faces / small functions only that creature uses.
2. **The model builder** (`buildXxx`) - the three.js skeleton, skin, face and `animate(st, dt)`.
3. **Registration** - `BUILDERS.<id> = buildXxx` (how the game finds the model).
4. **Stats & behaviour** - `ENTITY_DEFS.<id>` (core entities) or `D.<id>` (Phobia Wing):
   name, speed / chase speed, senses, damage, field-guide text and, for the Phobia Wing, the AI hooks.

Edit a file, then reload `other/entity-viewer.html` (it remembers the selected entity) or the game.

## Shared building blocks - `core/`

| file | what it is |
| --- | --- |
| `registry.js` | the two shared tables, `BUILDERS` and `ENTITY_DEFS` |
| `rig.js` | skeleton + skinned-mesh construction, materials, walk/crawl/spider animators |
| `models-kit.js` | skin / cloth texture painters, body builder, `buildModel()` |
| `phobia-kit-a.js`, `phobia-kit-b.js` | helpers shared by several Phobia Wing models (eyes, halos, chains, smoke...) |
| `phobia-ai.js` | helpers shared by the Phobia Wing AI hooks (`hunt`, `lunge`, `strike`, ...) |
| `phobia-finish.js` | runs last: marks Phobia Wing entries and builds the voice table |

## Adding a new entity

1. Copy the entity file closest to what you want and rename it `<id>.js` - the file name has to
   match the id, because the entity viewer prints `entities/<id>.js` in its error boxes.
2. Change the id in the `BUILDERS.<id>` line and in the `ENTITY_DEFS.<id>` / `D.<id>` line.
3. Add `'<id>.js'` to the list in `loader.js` (before `core/phobia-finish.js` for Phobia Wing entries).
   Nothing loads a file that is not in that list, so no tool and no pack can see the creature yet.
4. Add `"<id>"` to the `entities` array inside the `GAME` block in **both** `other/level-studio.html`
   and `other/entity-studio.html` (the arrays are alphabetical). That array is the level studio's
   "who is in it" pick list, and `tools/levelcheck/check.mjs` reads it to validate level files.
   The entity viewer and the field guide need no list: they show whatever `loader.js` loaded.
5. Reload `other/entity-studio.html` - it checks the wiring on start and names any id that is
   still missing from the pick lists (`other/entity-viewer.html` is the quick way to see the model).

Scripts are plain `<script>` tags (no modules), so everything works when opened straight from disk.

## Bonus-pack variants

`corruption.js` and `playground.js` hold creatures that are *variants* of existing ones. Each one is a
`mutated(baseId, options)` model builder (`core/mutate.js`: extra heads / arms / legs, stretched limbs,
tints, glitch jitter) plus an `ENTITY_DEFS` entry copied from the base creature, so it keeps the base's
behaviour flags (`watcher`, `crawler`, `statue`, `howl`, `darkOnly`, ...). They load after
`core/phobia-finish.js`; add a new variant with the `variant(id, base, build, def, voice)` helper at the top
of either file.
