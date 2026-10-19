window.GAME_DATA = window.GAME_DATA || {};
// v0.4.4 town (Director specs; lines from story/v044_town.md; cells 23-43 from tiles/tileset_48_v044.json).
// Map rows: digits 0-9 are the old tile ids, letters a-u are the v0.4.4 tiles below (TileMap reads letters as string ids).
Object.assign(GAME_DATA.tiles, {
  a: { name: "tall_grass_b",      color: "#24702e", solid: false, encounter: true, frame: 23 },
  b: { name: "tall_grass_edge_n", color: "#2f8f3a", solid: false, encounter: true, frame: 24 },
  c: { name: "house2_roof",   color: "#2aa59a", solid: true, frame: 25 },
  d: { name: "house2_wall",   color: "#4a78c8", solid: true, frame: 26 },
  e: { name: "house2_window", color: "#4a78c8", solid: true, frame: 27 },
  f: { name: "house2_door",   color: "#e8c030", solid: true, frame: 28 }, // facade only
  g: { name: "house_wall_window", color: "#e8d6b0", solid: true, frame: 29 },
  h: { name: "cafe_awning",   color: "#c84a3a", solid: true, frame: 30 },
  i: { name: "cafe_sign_l",   color: "#6a4a2a", solid: true, frame: 31 },
  j: { name: "cafe_sign_r",   color: "#6a4a2a", solid: true, frame: 32 },
  k: { name: "cafe_window",   color: "#9ad0e8", solid: true, frame: 33 },
  l: { name: "cafe_door",     color: "#6a4a2a", solid: true, frame: 34 }, // facade only
  m: { name: "tower_top",     color: "#5a4a7a", solid: true, frame: 35, base: 4 }, // transparent top: grass under it
  n: { name: "tower_windows", color: "#7a8ab0", solid: true, frame: 36 },
  o: { name: "tower_sign",    color: "#8a3fc0", solid: true, frame: 37 },
  p: { name: "tower_door",    color: "#9ad0e8", solid: true, frame: 38 }, // facade only
  q: { name: "path_v",        color: "#c9b37e", solid: false, frame: 39 },
  r: { name: "path_h",        color: "#c9b37e", solid: false, frame: 40 },
  s: { name: "path_exit_arrow", color: "#c9b37e", solid: false, frame: 41 },
  t: { name: "soon_barrier",  color: "#e8c030", solid: true, frame: 42 },
  u: { name: "soon_sign",     color: "#e8e0c8", solid: true, frame: 43 }
});
{ const M = GAME_DATA.maps.starter;
  // 20 -> 32 columns. Columns 0-18 keep their old coordinates (house door 7,4, mat 7,5, shop door 15,5, markers, hidden cards).
  M.width = 32;
  M.rows = [
    "11111111111111111111111111111111",
    "14444444444444444444tu4444444441",
    "10000000000002222244s44444444441",
    "10000222222002222244qcccc4hhhhh1",
    "100005g85g5005555544qdefd4ijklk1",
    "10000009000005565544q44444444441",
    "1000000000000000000r000000000001",
    "1000000000000000000r000000000001",
    "1003333330000000004444mmmm444441",
    "1003333330003333304444nnnnbbbbb1",
    "1003333330003333304444nnnnaaaaa1",
    "1003333330003333304444oopoaaaaa1",
    "10033333300033333074400000aaaaa1",
    "14000000000000000444444444444441",
    "11111111111111111111111111111111"
  ];
  // Facades (doors facade-only for now) + exit road: Z or walking into the tile shows the line. bump:false = Z only.
  M.facades = [
    { x: 23, y: 4, text: "door_house2" }, { x: 29, y: 4, text: "door_cafe" }, { x: 24, y: 11, text: "door_hustle_hq" },
    { x: 20, y: 1, text: "exit_block" }, { x: 21, y: 1, text: "sign_exit", bump: false }
  ];
  // Tall grass: the ONLY forced fight. rate per completed step on an encounter tile (cells 2/23/24), seeded via Formulas.rand.
  M.grass = { rate: 0.08, table: [{ group: "wild_ricky", weight: 45 }, { group: "wild_unboxer", weight: 35 }, { group: "wild_pair", weight: 20 }] };
  // Couch Cash (one-time each, saved in coinsFound)
  M.coins = [{ id: "cc_1", x: 2, y: 13, n: 5 }, { id: "cc_2", x: 25, y: 5, n: 7 }, { id: "cc_3", x: 30, y: 13, n: 10 }];
  // Goon markers wander inside their grass patch (radius around home), never onto the player; Z to fight only.
  M.goonWander = { everySteps: 3, radius: 2 };
  M.decor.push(
    { id: "thorne", sprite: "npc_thorne", x: 27, y: 7, cell: 48, col: 1, row: 2, solid: true, trainer: "trainer_thorne", color: "#3fa34d", bust: "thorne_bust" },
    { id: "pell", sprite: "npc_pell", x: 21, y: 5, cell: 48, col: 1, row: 0, solid: true, job: "mow", color: "#b07ac8", bust: "pell_bust" },
    { id: "gig_cam", sprite: "deco_gig_cam", x: 11, y: 6, w: 48, h: 48, solid: true, job: "extra", color: "#1a1423" }
  );
}
GAME_DATA.sprites.images.npc_thorne = "assets/style2/overworld/thorne_walk_48.png";
GAME_DATA.sprites.images.thorne_bust = "assets/style2/npc/thorne_bust_96.png";
GAME_DATA.sprites.images.npc_pell = "assets/style2/overworld/pell_walk_48.png";
GAME_DATA.sprites.images.pell_bust = "assets/style2/npc/pell_bust_96.png";
GAME_DATA.sprites.images.deco_gig_cam = "assets/style2/tiles/gig_cam_48.png";
// v0.4.6: no Thorne fighter in battle (creatures only); his overworld sprite + bust stay.
// Cards as enemies (trainer decks, wild fights, people's creatures): enemy id "card_<id>", stats/moves/barks from the card. ai "card": 50/50 basic/special.
for (const id of Object.keys(GAME_DATA.cards)) { const c = GAME_DATA.cards[id];
  GAME_DATA.enemies["card_" + id] = { name: c.name, short: c.short, type: c.type, base: c.base, baseXP: GAME_DATA.pb.baseXP[c.rarity], moves: c.moves, ai: "card", cardArt: id, barks: { enter: GAME_DATA.pb.barkPrefix[id] + "_enter", ko: GAME_DATA.pb.barkPrefix[id] + "_ko" } }; }
Object.assign(GAME_DATA.enemyGroups, {
  trainer_thorne: { members: [["card_hustle_hamster", 2], ["card_burner_beetle", 2]], bg: "drop_day", trainer: { id: "thorne", noRun: "thorne_no_run", winLine: "thorne_lose", loseLine: "thorne_win", coins: 30 /* Director: flat 30 for beating Thorne */ } },
  // v0.4.6 (story/v046_battle.md): wild grass fights are creatures only. Same levels and weights; group ids kept.
  wild_ricky:   { members: [["card_copypasta_cat", 2]], bg: "drop_day", wild: true },
  wild_unboxer: { members: [["card_reply_guy_rat", 2]], bg: "drop_day", wild: true },
  wild_pair:    { members: [["card_copypasta_cat", 2], ["card_mukbang_mole", 2]] /* v0.4.6 balance: Mole was Lv3 */, bg: "drop_day", wild: true }
});
GAME_DATA.jobs = { mow: { pay: 15 }, extra: { pay: 20, holdMs: 3000, cooldownMs: 10 * 60 * 1000 /* play time */ } };
Object.assign(GAME_DATA.text, { // story/v044_town.md (Story Writer, approved by Director)
  thorne_pre: "Up since 4 AM. Already did cold plunge, journaling, and a podcast.",
  thorne_pre2: "You. Me. Card battle. For content. Ready? Doesn't matter.",
  thorne_no_run: "No leaving. I already hit record.",
  thorne_win: "Easy W. Mom, I'm putting this in my portfolio.",
  thorne_lose: "This is fine. Failure is just a pivot I didn't plan.",
  thorne_after_win: "Rematch later. I need to rebrand first.",
  thorne_after_lose: "Go home. Hydrate. Grind. Come back.",
  grassFirst: "Something's rustling. It wants smoke.",
  sign_exit: "WILD ZONE: COMING SOON. Ask the server mod. He said soon™.",
  exit_block: "Path's closed. A guy with a ring light is filming it for clout.",
  coinFound: "Found {n} coins in a couch on the curb. Finders keepers.",
  job_mow_start: "Mow my lawn? 15 coins. Cash. No contracts. No questions.",
  job_mow_done: "It's crooked. Take your 15. Don't come back. (Come back tomorrow.)",
  gig_extra_start: "Need an extra. Just stand there and look jealous. 20 coins.",
  gig_extra_done: "Perfect. You looked SO broke. Here's 20.",
  door_house2: "Locked. A sticky note says 'Do Not Disturb. Streaming.'",
  door_cafe: "BURNT BEANS: closed. Barista is on a 'mental health month.'",
  door_hustle_hq: "HUSTLE HQ: invite only. The doorbell is a pitch deck.",
  // writer lines (story/v044_town.md)
  job_mow_wait: "Lawn's done. Grass grows tomorrow. Patience is a hustle too.",
  gig_extra_wait: "Ricky's out of budget. Come back in a bit. Exposure is free though.",
  gig_extra_hold: "Hold still... look natural... less natural.",
  gig_extra_cancel: "You moved! Ricky's crying. Take it again later."
});
