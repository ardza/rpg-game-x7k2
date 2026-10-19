window.GAME_DATA = window.GAME_DATA || {};
// Tile legend (v0.3.1, style2 tileset_48.png cells: 0 grass, 1 path, 2 tall_grass, 3 house_wall, 4 house_roof, 5 shed, 6 fence, 7 card_sparkle, 8 shop_door).
// base: draw that tile first (fence/shed are transparent decor over grass). Map ids stay small ints; 3 = tall grass (roamer zones).
GAME_DATA.tiles = {
  0: { name: "path",       color: "#c9b37e", solid: false, frame: 1 },
  1: { name: "fence",      color: "#8a6a44", solid: true,  frame: 6, base: 4 },
  2: { name: "house_roof", color: "#c8402c", solid: true,  frame: 4 },
  3: { name: "tall_grass", color: "#2f8f3a", solid: false, encounter: true, frame: 2 },
  4: { name: "grass",      color: "#5fb85a", solid: false, frame: 0 },
  5: { name: "house_wall", color: "#e8d6b0", solid: true,  frame: 3 },
  6: { name: "shop_door",  color: "#6b4a2a", solid: true,  frame: 8 }, // no interior yet
  7: { name: "shed",       color: "#7a5a3a", solid: true,  frame: 5, base: 4 },
  8: { name: "house_door", color: "#c8322b", solid: true,  frame: 21 }, // v0.3.5: warp tile (maps.starter.doors)
  9: { name: "house_door_mat", color: "#8fe03a", solid: false, frame: 22 }
};
// Sparkle cell 7 is used as an overlay for plain-sight hidden cards (GAME_DATA.cardSparkleFrame).
GAME_DATA.cardSparkleFrame = 7;
GAME_DATA.tileset = { src: "assets/style2/tiles/tileset_48.png", tileSize: 48, columns: 44 }; // v0.4.3: 2112x48, 44 cells in one row (cells 0-22 unchanged; 23-43 for v0.4.4, tiles/tileset_48_v044.json)
GAME_DATA.maps = {
  starter: {
    name: "Mossy Hollow", width: 20, height: 15, spawn: { x: 2, y: 2 },
    // 8A zones (DESIGN.md v0.2): roamers stay on zone tiles (tall grass) inside rect [x, y, w, h].
    zones: [
      { id: "west", rect: [3, 8, 6, 5], tiles: [3], maxActive: 3, respawnSteps: 40,
        spawnTable: [{ species: "puddlop", weight: 40, min: 2, max: 3 /* locked cap Lv3 */ }, { species: "sproutle", weight: 40, min: 2, max: 3 /* capped Lv3 v0.2.1 */ }, { species: "grumblet", weight: 20, min: 2, max: 3 }] },
      { id: "east", rect: [12, 9, 5, 4], tiles: [3], maxActive: 3, respawnSteps: 40,
        spawnTable: [{ species: "puddlop", weight: 30, min: 2, max: 3 }, { species: "sproutle", weight: 30, min: 2, max: 3 }, { species: "grumblet", weight: 20, min: 2, max: 3 }, { species: "emberkit", weight: 20, min: 2, max: 3 }] }
    ],
    roam: { moveEverySteps: 2, fleeSteps: 2, tweenSpeed: 6 },
    // Static decor. solid: blocks its tile. Sprites from GAME_DATA.sprites.images (rect fallback).
    // NPC decor (style2 walk sheets, 48px cells; col 1 = standing frame). v0.2.1 suit guy -> Ricky + Unboxing Kid; office sign -> sign_48.
    decor: [
      { id: "ricky", sprite: "npc_ricky", x: 10, y: 6, cell: 48, col: 1, row: 0, solid: true, text: "npcRicky", color: "#ff3e8a" },
      { id: "unboxer", sprite: "npc_unboxer", x: 7, y: 7, cell: 48, col: 1, row: 3, solid: true, text: "npcUnboxer", color: "#ff7a1a" },
      { id: "sign", sprite: "deco_sign", x: 1, y: 6, w: 48, h: 48, solid: true, text: "sign" },
      { id: "mom", sprite: "npc_mom", x: 13, y: 6, cell: 48, col: 1, row: 0, solid: true, text: ["npcMom1", "npcMom2", "npcMom3"], color: "#ff3e8a" },
      { id: "dad", sprite: "npc_dad", x: 17, y: 13, cell: 48, col: 1, row: 2, solid: true, text: ["npcDad1", "npcDad2", "npcDad3"], color: "#2f6bff" }
    ],
    // Hidden cards (DESIGN §5). kind "plain": visible sparkle, step on it. kind "search": invisible, face the tile and press Z.
    // text: per-spot found line (text.js key); falls back to foundCard. Example spots only; the Island 1 set of 8 comes with M6.
    hidden: [
      { id: "mh_plain_1", cardId: "hypewick", holo: false, kind: "plain", x: 17, y: 7, text: "foundHypewick" },
      { id: "mh_search_1", cardId: "influencorn", holo: false, kind: "search", x: 9, y: 4, text: "foundInfluencorn" } // v0.3.5: moved from (7,4) (now the house door); found flag is the id
    ],
    rows: [
      "11111111111111111111",
      "14444444444444444441",
      "10000000000002222241",
      "10000222222002222241",
      "10000558555005555541",
      "10000009000005565541",
      "10000000000000000041",
      "10000000000000000041",
      "10033333300000000041",
      "10033333300033333041",
      "10033333300033333041",
      "10033333300033333041",
      "10033333300033333071",
      "14000000000000000441",
      "11111111111111111111"
    ]
  }
};
