window.GAME_DATA = window.GAME_DATA || {};
// Enemies — DESIGN.md "Enemies v0.4.1 (Director)". PROPOSAL: pending Commissioner approval. Numbers mirror tests/sim_enemies_v041.js.
GAME_DATA.enemiesProposal = true;
GAME_DATA.enemies = {
  // v0.4.6 (Director, story/v046_npc_fights.md): people don't fight. A person's slot in a group sends a creature at that slot's level.
  // intro shows once per fight; ko plays only when that person's LAST creature in the group goes down (other KOs: normal pbFaint).
  // baseXP stays the person's (XP unchanged); coins are by level (unchanged).
  ricky:   { name: "Ring Light Ricky", short: "Ricky", person: true, sends: "podcast_parrot", baseXP: 50, intro: "ricky_intro", ko: "ricky_ko" },
  unboxer: { name: "Unboxing Kid", short: "Unboxer", person: true, sends: "reaction_raccoon", baseXP: 50, intro: "unboxer_intro", ko: "unboxer_ko" },
  // v0.4.6 Director: Maxx (debug-only boss) is a person too; he sends his boss Clout Kraken (unit: maxx_kraken). His intro/low_hp/ko/no_run lines stay his.
  maxx:    { name: "Maxx Volume", short: "Maxx", person: true, sends: "clout_kraken", unit: "maxx_kraken", baseXP: 100, intro: "maxx_intro", ko: "maxx_ko",
             noRun: "maxx_no_run", lowHp: "maxx_low_hp", drop: { pack: "basic", n: 1 } },
  // Maxx's Kraken: Clout Kraken art/type, boss stats (Director: atk 85 / hp 95; def/spd = old Maxx 70/60), boss HP mult, Maxx's 3 moves (barks moved to the Kraken).
  maxx_kraken: { name: "Clout Kraken", short: "Kraken", cardArt: "clout_kraken", type: "Neutral", base: { hp: 52, atk: 80, def: 70, spd: 60 } /* v0.4.6 Director: atk 80; hp 82 -> 52 for the 4-Commons Lv3 deck (~38%; Rare deck ~96%, tests/sim_v046.js). v0.4.3 Maxx was hp 105 / atk 112 */, baseXP: 100,
             hpMult: 1.7, boss: true, moves: ["hot_take", "chat_spam", "donation_goal"], ai: "maxx" }
};
// Enemy groups (fixed, visible on the map; DESIGN §1 "fight visible enemy groups"). Levels are per member.
// coins (optional): explicit payout for the group (v0.4.6 Director: goons stay 11/31/66); without it coins = sum(5 + 3L) (x1.5 boss).
GAME_DATA.enemyGroups = {
  mh_g1: { members: [["ricky", 2]], bg: "drop_day", coins: 11 },                                  // early-route easy fight (Lv2-4 note)
  mh_g2: { members: [["unboxer", 3], ["ricky", 1]], bg: "drop_day", coins: 31 },
  mh_g3: { members: [["ricky", 3], ["unboxer", 3], ["ricky", 4]], bg: "drop_day", coins: 66 },
  boss_maxx: { members: [["maxx", 8]], bg: "stream_room", boss: true }                 // boss area not built yet: debug/test only
};
// Overworld markers (solid decor; Z or bump to fight; hidden once in defeatedGroups)
GAME_DATA.maps.starter.decor.push(
  { id: "grp_mh_g1", group: "mh_g1", sprite: "npc_ricky", x: 4, y: 9, cell: 48, col: 1, row: 3, solid: true, color: "#ff3e8a" },
  { id: "grp_mh_g2", group: "mh_g2", sprite: "npc_unboxer", x: 14, y: 10, cell: 48, col: 1, row: 2, solid: true, color: "#ff7a1a" },
  { id: "grp_mh_g3", group: "mh_g3", sprite: "npc_ricky", x: 16, y: 12, cell: 48, col: 1, row: 2, solid: true, color: "#ff3e8a" }
);
