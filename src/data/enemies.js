window.GAME_DATA = window.GAME_DATA || {};
// Enemies — DESIGN.md "Enemies v0.4.1 (Director)". PROPOSAL: pending Commissioner approval. Numbers mirror tests/sim_enemies_v041.js.
GAME_DATA.enemiesProposal = true;
GAME_DATA.enemies = {
  ricky:   { name: "Ring Light Ricky", type: "Neutral", base: { hp: 40, atk: 56, def: 40, spd: 55 }, baseXP: 50, moves: ["selfie_jab", "ring_light_flash"], ai: "ricky",
             barks: { enter: "ricky_enter", ko: "ricky_ko" } },
  unboxer: { name: "Unboxing Kid", type: "Stone", base: { hp: 55, atk: 56, def: 50, spd: 35 }, baseXP: 50, moves: ["box_cutter", "peanut_barrage"], ai: "unboxer",
             barks: { enter: "unboxer_enter", ko: "unboxer_ko" } },
  maxx:    { name: "Maxx Volume", type: "Ember", base: { hp: 105, atk: 112, def: 70, spd: 60 } /* v0.4.3 retune vs a 4-card deck of distinct real cards: was hp 80, atk 90 */, baseXP: 100, hpMult: 1.7 /* v0.4.1 Director: HP from the formula (Lv8 -> 73), hard-set 81 removed */, boss: true,
             moves: ["hot_take", "chat_spam", "donation_goal"], ai: "maxx", noRun: "maxx_no_run", lowHp: "maxx_low_hp", drop: { pack: "basic", n: 1 },
             barks: { enter: "maxx_intro", ko: "maxx_ko" } }
};
// Enemy groups (fixed, visible on the map; DESIGN §1 "fight visible enemy groups"). Levels are per member.
GAME_DATA.enemyGroups = {
  mh_g1: { members: [["ricky", 2]], bg: "drop_day" },                                  // early-route easy fight (Lv2-4 note)
  mh_g2: { members: [["unboxer", 3], ["ricky", 4]], bg: "drop_day" },
  mh_g3: { members: [["ricky", 5], ["unboxer", 6], ["ricky", 6]], bg: "drop_day" },
  boss_maxx: { members: [["maxx", 8]], bg: "stream_room", boss: true }                 // boss area not built yet: debug/test only
};
// Overworld markers (solid decor; Z or bump to fight; hidden once in defeatedGroups)
GAME_DATA.maps.starter.decor.push(
  { id: "grp_mh_g1", group: "mh_g1", sprite: "npc_ricky", x: 4, y: 9, cell: 48, col: 1, row: 3, solid: true, color: "#ff3e8a" },
  { id: "grp_mh_g2", group: "mh_g2", sprite: "npc_unboxer", x: 14, y: 10, cell: 48, col: 1, row: 2, solid: true, color: "#ff7a1a" },
  { id: "grp_mh_g3", group: "mh_g3", sprite: "npc_ricky", x: 16, y: 12, cell: 48, col: 1, row: 2, solid: true, color: "#ff3e8a" }
);
