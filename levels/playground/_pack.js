// The Playground levels use furniture sets that live in the Phobia Wing pack
// file; a level pack is self-contained, so they are repeated here.
//
// On top of `wall` and `floor` a set may declare `big`: the same
// [type, [min, max], opts] shape, but each entry takes a whole block of open
// cells (smallest block its footprint fits in) with nothing already standing in
// it, so rides land in a room instead of inside a wall. See levels/README.md.
//
//   wall  [type, chance per wall slot, y, opts]  - placed against a wall
//   floor [type, [min, max], opts, y]            - placed in a random cell
//   big   [type, [min, max], opts]               - placed in a clear cell block
LabLevels.packExtra('playground', {
  items: { ticket: 'Ride Ticket', token: 'Arcade Token' },
  props: {
  nursery: {
    wall: [['bed', 0.03], ['C:dresser', 0.03], ['C:nightstand', 0.03], ['lamp_floor', 0.01], ['balloons', 0.01, 0, () => ({ top: 2.0 })]],
    floor: [['C:present', [1, 3], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })], ['chair_plastic', [1, 3]], ['C:box', [0, 2]], ['table', [0, 1]]],
  },
  theater: {
    wall: [['painting', 0.04, 1.55], ['lamp_floor', 0.02], ['C:cabinet', 0.012, 1.15, { mat: 'wood_dark' }], ['couch', 0.01]],
    floor: [['pedestal', [2, 5]], ['rope_posts', [1, 3]], ['bench', [1, 3], { mat: 'wood_dark' }], ['C:crate', [0, 2]]],
  },

  // ---------------------------------------------------------------- the gate
  // The entrance: turnstiles that no longer turn, bunting over the doors, and
  // the presents the park handed out on the way in.
  gate: {
    wall: [['party_banner', 0.06], ['C:vent', 0.01], ['outlet', 0.04, 0.3], ['C:counter', 0.02]],
    floor: [['C:present', [1, 3], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })], ['chair_plastic', [0, 3]], ['C:box', [0, 2]], ['trash_bin', [0, 2]]],
    big: [['turnstile', [1, 2]], ['speaker_pole', [0, 1]]],
  },
  // Helium balloons on ribbons that run the length of the halls.
  foyer: {
    wall: [['balloon_bunch', 0.14, 0, (rng) => ({ top: 2.1 + rng.range(0, 0.3) })], ['balloons', 0.04, 0, () => ({ top: 2.2 })], ['party_banner', 0.03]],
    floor: [['balloon_bunch', [2, 5], () => ({ top: 2.15 })], ['C:present', [1, 3], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })], ['chair_plastic', [0, 2]]],
    big: [['turnstile', [0, 1]]],
  },
  // Low ceilings, deep carpet, and the balls piled against the walls.
  ballpit: {
    wall: [['balloons', 0.02, 0, () => ({ top: 2.0 })], ['C:box', 0.02], ['outlet', 0.05, 0.3]],
    floor: [['ball_pile', [2, 4]], ['C:box', [1, 2]], ['chair_plastic', [0, 2]], ['trash_bin', [0, 1]]],
    big: [['ball_pit', [1, 2]]],
  },
  // Cabinets in rows to the horizon, every screen showing the same four words.
  arcade: {
    wall: [['arcade_cabinet', 0.55], ['C:vent', 0.008], ['outlet', 0.05, 0.3]],
    floor: [['arcade_cabinet', [2, 5]], ['pinball_table', [1, 3]], ['chair_plastic', [0, 2]], ['trash_bin', [0, 1]]],
    big: [['arcade_cabinet', [0, 1]]],
  },
  // Painted horses, brass poles, and the same song over and over.
  carousel: {
    wall: [['party_banner', 0.04], ['bench', 0.012]],
    floor: [['chair_plastic', [0, 2]], ['C:present', [0, 2], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue']) })], ['planter', [0, 2]]],
    big: [['carousel', [1, 1]], ['speaker_pole', [0, 2]]],
  },
  // Turf you land on a little harder than you expect.
  bounce: {
    wall: [['bench', 0.012], ['C:box', 0.008]],
    floor: [['ball_pile', [0, 2]], ['chair_plastic', [0, 2]], ['C:box', [0, 1]]],
    big: [['trampoline', [1, 2]]],
  },
  // Fountains, a lazy river of tile, and plastic palms.
  splash: {
    wall: [['C:locker', 0.03, 0, { mat: 'metal_white' }], ['bench', 0.012], ['C:vent', 0.012]],
    floor: [['palm_tree', [1, 3]], ['chair_plastic', [0, 3], { mat: 'plastic_white' }], ['planter', [0, 2]], ['C:box', [0, 1]]],
    big: [['fountain', [1, 2]]],
  },
  // Six storeys of atrium, escalators stopping between floors.
  escalator: {
    wall: [['C:counter', 0.03], ['vending_machine', 0.02], ['bench', 0.012], ['party_banner', 0.02]],
    floor: [['bench', [1, 3]], ['planter', [1, 3]], ['shopping_cart', [0, 2]], ['C:box', [0, 2]], ['trash_bin', [0, 1]]],
    big: [['escalator', [2, 3], { len: 5.6, rise: 2.6 }]],
  },
  // Corridors of mirrors, each reflecting a slightly different corridor.
  mirrors: {
    wall: [['mirror_panel', 0.4], ['C:vent', 0.006]],
    floor: [['warp_mirror', [1, 3]], ['pedestal', [0, 2]], ['bench', [0, 2], { mat: 'wood_dark' }]],
    big: [['warp_mirror', [0, 1]]],
  },
  // Service walkways of a ride: rails, sleepers, and nothing on them.
  ridedeck: {
    wall: [['C:vent', 0.012], ['fire_extinguisher', 0.01], ['outlet', 0.04, 0.3]],
    floor: [['C:crate', [1, 3]], ['C:toolbox', [0, 2]], ['pallet', [0, 2]], ['barrel', [0, 2]], ['C:box', [0, 2]]],
    big: [['coaster_rail', [1, 2], { len: 1.8, h: 0.5 }], ['speaker_pole', [0, 1]]],
  },
  // A car park of bumper cars and painted lines.
  karts: {
    wall: [['C:toolbox', 0.02], ['C:cabinet', 0.012, 1.15, { mat: 'metal_red' }], ['electrical_panel', 0.02], ['C:locker', 0.01, 0, { mat: 'metal_grey' }]],
    floor: [['bumper_car', [2, 4]], ['go_kart', [1, 3]], ['barrel', [0, 2]], ['C:crate', [0, 2]], ['C:toolbox', [0, 1]]],
    big: [['go_kart', [0, 1]]],
  },
  // A sea of turquoise water under a plastic sky.
  wavepool: {
    wall: [['C:locker', 0.02, 0, { mat: 'metal_white' }], ['C:vent', 0.01]],
    floor: [['palm_tree', [0, 2]], ['chair_plastic', [0, 3], { mat: 'plastic_white' }], ['C:box', [0, 1]]],
    big: [['wave_machine', [1, 2]]],
  },
  // Frosting-pink walls, sponge floors, a candle on every table.
  cakehall: {
    wall: [['party_banner', 0.06], ['C:counter', 0.025], ['C:cabinet', 0.01, 1.15, { mat: 'metal_white' }]],
    floor: [['cake_table', [2, 4]], ['chair_plastic', [1, 3]], ['C:present', [0, 3], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })]],
    big: [['cake_table', [0, 1]]],
  },
  // Wall-to-wall trampolines under a roof of coloured nets.
  trampolines: {
    wall: [['C:locker', 0.03, 0, { mat: 'metal_white' }], ['bench', 0.012], ['C:vent', 0.01]],
    floor: [['trampoline', [1, 2]], ['bench', [0, 2]], ['C:box', [0, 1]]],
    big: [['trampoline', [3, 5]]],
  },
  // The dark ride, with the cars taken away.
  ghosttrain: {
    wall: [['glow_ghost', 0.24], ['C:cabinet', 0.012, 1.15, { mat: 'wood_dark' }], ['C:vent', 0.01]],
    floor: [['log_boat', [1, 3]], ['C:crate', [0, 3]], ['bench', [0, 2], { mat: 'wood_dark' }], ['rope_posts', [0, 2]]],
    big: [['coaster_rail', [1, 2], { len: 4.0, h: 0.4 }]],
  },
  // Cable-car stations joined by catwalks over a bright nothing.
  skytram: {
    wall: [['C:vent', 0.012], ['fire_extinguisher', 0.01]],
    floor: [['C:crate', [1, 3]], ['pallet', [0, 2]], ['barrel', [0, 2]], ['C:box', [0, 1]]],
    big: [['pylon', [1, 1]], ['cable_car', [0, 1]]],
  },
  // Crooked rooms and a distorting mirror in every doorway.
  funhouse: {
    wall: [['warp_mirror', 0.18], ['mirror_panel', 0.16], ['party_banner', 0.04]],
    floor: [['warp_mirror', [1, 3]], ['pedestal', [0, 2]], ['ball_pile', [0, 2]], ['chair_plastic', [0, 2]]],
    big: [['warp_mirror', [0, 1]]],
  },
  // A tower lobby of glass lifts, each stopping at the wrong place.
  elevators: {
    wall: [['C:counter', 0.025], ['party_banner', 0.02], ['bench', 0.012]],
    floor: [['bench', [1, 3]], ['planter', [1, 3]], ['C:box', [0, 2]], ['trash_bin', [0, 1]]],
    big: [['glass_lift', [2, 3]]],
  },
  // Channels of fast brown water, fibreglass logs, a conveyor going the wrong way.
  flume: {
    wall: [['C:locker', 0.02, 0, { mat: 'metal_white' }], ['C:vent', 0.01], ['fire_extinguisher', 0.01]],
    floor: [['log_boat', [2, 4], null, 0.42], ['chair_plastic', [0, 2]], ['C:box', [0, 1]]],
    big: [['log_boat', [1, 2], null], ['wave_machine', [0, 1]]],
  },
  // Bunting from every window, floats parked end to end.
  parade: {
    wall: [['bunting', 0.34], ['party_banner', 0.05], ['C:counter', 0.012]],
    floor: [['bumper_car', [1, 3]], ['ball_pile', [0, 2]], ['chair_plastic', [0, 3]], ['trash_bin', [0, 2]]],
    big: [['parade_float', [1, 2]]],
  },
  // An ice-slide park under artificial snow.
  winter: {
    wall: [['C:locker', 0.02, 0, { mat: 'metal_white' }], ['bench', 0.012], ['C:vent', 0.01]],
    floor: [['snow_drift', [2, 4]], ['C:crate', [0, 2]], ['bench', [0, 2], { mat: 'wood_dark' }], ['C:box', [0, 1]]],
    big: [['ice_slide', [1, 2], { len: 5.6, h: 1.9 }]],
  },
  // Concrete corridors, cable runs, costume racks and heads on pegs.
  backstage: {
    wall: [['costume_head', 0.26], ['C:locker', 0.03, 0, { mat: 'metal_grey' }], ['pipe_cluster', 0.02, 0.3], ['C:vent', 0.02], ['electrical_panel', 0.012]],
    floor: [['costume_rack', [2, 4]], ['C:crate', [0, 3]], ['pallet', [0, 2]], ['barrel', [0, 2]], ['C:toolbox', [0, 2]]],
    big: [['costume_rack', [0, 1]]],
  },
  // Every ride you have been on, running all at once.
  midway: {
    wall: [['party_banner', 0.06], ['bunting', 0.08], ['balloon_bunch', 0.06, 0, () => ({ top: 2.2 })], ['C:counter', 0.02]],
    floor: [['bumper_car', [1, 2]], ['ball_pile', [0, 2]], ['arcade_cabinet', [1, 3]], ['palm_tree', [0, 2]], ['cake_table', [0, 2]], ['C:present', [0, 2], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })]],
    big: [['carousel', [0, 1]], ['trampoline', [0, 1]], ['fountain', [0, 1]], ['speaker_pole', [0, 2]], ['turnstile', [0, 1]]],
  },
  // The slide towers themselves are the level: a little park dressing around them.
  slidepark: {
    wall: [['party_banner', 0.05], ['bunting', 0.05], ['bench', 0.012], ['C:locker', 0.02, 0, { mat: 'metal_white' }]],
    floor: [['chair_plastic', [0, 3]], ['C:box', [0, 2]], ['planter', [1, 2]], ['trash_bin', [0, 2]]],
    big: [['speaker_pole', [0, 1]], ['ball_pit', [0, 1]]],
  },
  // A stair shaft with nothing else in it, which is the point of the level:
  // the climb is the level, so the only furniture is a clock and a crate.
  barestair: {
    wall: [['clock_wall', 0.006, 2.1], ['C:vent', 0.004]],
    floor: [['C:box', [0, 1]]],
  },
  // A forest of round trees in pink and mint and lemon.
  candyforest: {
    wall: [['balloon_bunch', 0.05, 0, () => ({ top: 2.3 })]],
    floor: [['candy_tree', [1, 3]], ['C:present', [0, 2], (rng) => ({ mat: rng.pick(['gift_red', 'gift_blue', 'gift_green']) })], ['chair_plastic', [0, 2]], ['ball_pile', [0, 2]]],
    big: [['candy_tree', [0, 1]]],
  },
  },
});
