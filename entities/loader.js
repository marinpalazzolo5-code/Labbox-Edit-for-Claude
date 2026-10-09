// Loads every entity file (in dependency order) with plain <script> tags, so it
// works when the page is opened straight from disk (file://).
//
// The folders are level packs:
//   base/        creatures any level may use, in any pack (custom levels included)
//   phobia/      The Phobia Wing only
//   corruption/  Corruption only (levels/corrupt/)
//   playground/  Playground only
//   core/        shared building blocks, no creatures
// A creature in a pack folder can only be used by the levels of that pack; see
// entities/README.md. tools/levelcheck/check.mjs enforces it.
//
// TO ADD A NEW ENTITY: create entities/<folder>/<id>.js (copy an existing one) and add
// '<folder>/<id>.js' to the list below - before 'core/phobia-finish.js' if it is a
// Phobia Wing style entry (D.<id>), after 'core/mutate.js' if it is a mutated variant.
// Requires lib/three.js, lib/BufferGeometryUtils.js and lib/shaderpatch.js first.
//
// After loading, window.LabEntities says where every creature came from:
//   LabEntities.packOf[id]   'base' | 'phobia' | 'corruption' | 'playground'
//   LabEntities.files[id]    'base/smiler.js' (path inside entities/)
//   LabEntities.ids()        every creature id, in load order
//   LabEntities.allowed(id, pack)   may a level of `pack` (pack id or levels/ folder) use it?
(function () {
  var base = document.currentScript.src.replace(/[^\/]*$/, '');
  var files = [
    'core/registry.js',
    'core/rig.js',
    'core/models-kit.js',
    'core/phobia-kit-a.js',
    'core/phobia-kit-b.js',
    'core/phobia-ai.js',
    'base/smiler.js',
    'base/partygoer.js',
    'base/howler.js',
    'base/skinstealer.js',
    'base/chase.js',
    'base/hound.js',
    'base/faceling.js',
    'base/wretch.js',
    'base/clump.js',
    'base/deathmoth.js',
    'base/mannequin.js',
    'base/haze.js',
    'base/worm.js',
    'base/whisperer.js',
    'base/stature.js',
    'base/crawler.js',
    'base/duller.js',
    'base/troglosidae.js',
    'base/window.js',
    'base/beast.js',
    'base/peripheral.js',
    'base/puppet.js',
    'phobia/weaver.js',
    'phobia/coil.js',
    'phobia/goodboy.js',
    'phobia/murder.js',
    'phobia/ninelives.js',
    'phobia/revenant.js',
    'phobia/porcelain.js',
    'phobia/showman.js',
    'base/jester.js',
    'phobia/mourner.js',
    'phobia/phlebotomist.js',
    'phobia/lure.js',
    'phobia/palestag.js',
    'base/updraft.js',
    'base/colossus.js',
    'phobia/squeeze.js',
    'phobia/horizon.js',
    'phobia/absence.js',
    'phobia/deephand.js',
    'phobia/onlooker.js',
    'phobia/someone.js',
    'phobia/hive.js',
    'phobia/umbra.js',
    'phobia/reflection.js',
    'phobia/examiner.js',
    'phobia/flawless.js',
    'phobia/arbiter.js',
    'phobia/sandman.js',
    'phobia/thorn.js',
    'phobia/formless.js',
    'phobia/dread.js',
    'phobia/phantom.js',
    'phobia/stranger.js',
    'phobia/hourman.js',
    'phobia/counter.js',
    'phobia/glitch.js',
    'phobia/stormcaller.js',
    'base/frostbitten.js',
    'base/bleeder.js',
    'phobia/bloom.js',
    'phobia/librarian.js',
    'phobia/overgrowth.js',
    'phobia/glutton.js',
    'base/rootwalker.js',
    'base/demon.js',
    'base/shadow.js',
    'phobia/supervisor.js',
    'base/gremlin.js',
    'base/shade.js',
    'core/phobia-finish.js',
    // bonus packs: mutated / repainted variants of the creatures above
    'core/mutate.js',
    'corruption/mut_chorus.js',
    'corruption/mut_splice.js',
    'corruption/mut_thicket.js',
    'corruption/mut_sprawl.js',
    'corruption/mut_fractured.js',
    'base/mut_drowned.js',
    'playground/playground.js'
  ];

  // ---------------------------------------------------------------- who came from where
  // Between two file tags an inline marker diffs the keys of the shared tables
  // (BUILDERS, ENTITY_DEFS and the Phobia Wing's D): whatever is new was added by the
  // file that just ran, so it belongs to that file's folder.
  var FOLDERS = ['base', 'phobia', 'corruption', 'playground'];
  var seen = {};
  var LE = window.LabEntities = {
    FOLDERS: FOLDERS,
    files: {},                 // id -> 'base/smiler.js'
    packOf: {},                // id -> 'base' | 'phobia' | 'corruption' | 'playground'
    list: files.slice(),       // every file, in load order
    order: [],                 // every creature id, in load order
    ids: function () { return LE.order.slice(); },
    /** The entity folder for a level pack: 'main' / 'base' -> 'base', 'corrupt' -> 'corruption'. */
    folderOf: function (pack) {
      if (!pack || pack === 'main' || pack === 'base') return 'base';
      if (pack === 'corrupt') return 'corruption';
      return pack;
    },
    /** May a level of `pack` (pack id or levels/ folder name) use creature `id`? */
    allowed: function (id, pack) {
      var p = LE.packOf[id] || 'base';
      return p === 'base' || p === LE.folderOf(pack);
    },
    _mark: function (file) {
      var M = window.__mod || {};
      var reg = M['src/entities/registry.js'] || {};
      var ai = M['src/phobia/ai.js'] || {};
      var folder = file.indexOf('/') > 0 ? file.slice(0, file.indexOf('/')) : 'base';
      var tables = [reg.BUILDERS, reg.ENTITY_DEFS, ai.D];
      for (var t = 0; t < tables.length; t++) {
        if (!tables[t]) continue;
        for (var id in tables[t]) {
          var key = t + ':' + id;
          if (seen[key]) continue;
          seen[key] = true;
          // core/ holds building blocks, not creatures; a creature is claimed by the
          // first pack file that adds it to any of the tables
          if (folder === 'core' || LE.files[id]) continue;
          LE.files[id] = file;
          LE.packOf[id] = folder;
          LE.order.push(id);
        }
      }
    }
  };
  for (var i = 0; i < files.length; i++) {
    document.write('<script src="' + base + files[i] + '"><\/script>');
    document.write('<script>window.LabEntities._mark(' + JSON.stringify(files[i]) + ')<\/script>');
  }
})();
