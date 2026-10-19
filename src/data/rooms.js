window.GAME_DATA = window.GAME_DATA || {};
// Interior rooms (v0.3.4). GAME_DATA.roomsData is a verbatim copy of assets/style2/rooms/rooms_48.json, embedded as JS
// because file:// can't fetch JSON. tests/headless.js checks it still matches the asset file. Regenerate if the artist edits it.
GAME_DATA.roomsData = {"tileSize":48,"tileset":"tiles/interior_48.png","cells":["floor_wood","floor_rug","floor_tile","wall","wall_window","wall_poster","door","counter","counter_till","shelf_packs","bed_head","bed_foot","desk","desk_laptop","ring_light","plant","box_pile","mat_exit","shelf_soldout"],"blocking":[3,4,5,7,8,9,10,11,12,13,14,15,16,18],"shop":{"tiles":[[3,3,3,5,3,3,3,3,3,3,3,5,3,3,3],[9,9,9,9,9,2,2,2,2,2,9,9,9,18,9],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[2,2,2,7,7,7,8,7,7,7,2,2,2,2,2],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[9,9,2,2,2,2,2,2,2,2,2,2,2,9,9],[9,9,2,2,2,2,2,2,2,2,2,2,2,9,9],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,2],[16,2,2,2,2,2,2,2,2,2,2,2,2,15,2],[2,2,2,2,2,2,2,2,2,2,2,2,2,2,15],[3,3,3,3,3,3,3,17,3,3,3,3,3,3,3]],"collision":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,1,1,1,1,0,0,0,0,0,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,1,1,1,1,1,1,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,1,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1]],"shopkeeper_spot":[6,2],"exit":[7,10],"interact":[{"key":"shop_entry","tile":[7,9],"trigger":"enter"},{"key":"shelf_soldout","tile":[13,1],"trigger":"face"}]},"bedroom":{"tiles":[[3,3,3,5,3,4,4,3,3,5,3,3,3,3,3],[10,0,0,0,0,0,0,12,13,14,0,0,0,0,15],[11,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,16],[0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,1,1,1,1,1,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[15,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],[3,3,3,3,3,3,3,6,3,3,3,3,3,3,3]],"collision":[[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,0,1,1,1,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,1,1,0,1,1,1,1,1,1,1]],"spawn":[7,8],"exit":[7,10],"interact":[{"key":"bed","tile":[0,1],"also":[[0,2]],"trigger":"face"},{"key":"pc","tile":[8,1],"trigger":"face"},{"key":"poster","tile":[3,0],"also":[[9,0]],"trigger":"face"}]}};
// Room wiring (programmer data): background, where the exit leads, the shopkeeper, text keys per interact id.
GAME_DATA.roomDefs = {
  bedroom: { name: "Your Room", bg: "assets/style2/rooms/bedroom_720x528.png", exitTo: { map: "starter", x: 7, y: 5, facing: "down" } },
  shop:    { name: "Pack Shack", bg: "assets/style2/rooms/shop_interior_720x528.png", exitTo: { map: "starter", x: 15, y: 6, facing: "down" },
             entry: { x: 7, y: 9, facing: "up" }, npc: { id: "shopkeeper", sprite: "npc_shopkeeper", opens: "shop", reach: [[6, 3]] } }
};
// interact key -> text.js key (battle_text.md "Room inspect lines", same ids since v0.3.5)
GAME_DATA.roomText = { bed: "roomBed", pc: "roomPc", poster: "roomPoster", shelf_soldout: "roomShelfSoldout", shop_entry: "roomShopEntry" };
GAME_DATA.startMap = "bedroom"; // new game starts in the bedroom
// v0.3.5 Mom intro in the bedroom: she walks in through the door to stand below the player, says her lines, gives coins, leaves.
GAME_DATA.momWalkIn = { sprite: "npc_mom", cell: 48, row: 1 /* facing up */, from: { x: 7, y: 10 }, to: { x: 7, y: 9 }, ms: 700, playerFacing: "down" };
GAME_DATA.sprites.images.interior = "assets/style2/" + GAME_DATA.roomsData.tileset;
GAME_DATA.sprites.images.player_bust = "assets/style2/npc/player_bust_96.png";
for (const [id, r] of Object.entries(GAME_DATA.roomDefs)) {
  const src = GAME_DATA.roomsData[id], blocking = new Set(GAME_DATA.roomsData.blocking), sp = src.spawn || (r.entry && [r.entry.x, r.entry.y]);
  GAME_DATA.sprites.images["room_" + id] = r.bg;
  const decor = r.npc ? [{ id: r.npc.id, sprite: r.npc.sprite, x: src.shopkeeper_spot[0], y: src.shopkeeper_spot[1], cell: 48, col: 1, row: 0, color: "#8a3fc0", solid: true, opens: r.npc.opens, reach: r.npc.reach }] : [];
  GAME_DATA.maps[id] = { name: r.name, room: true, width: src.tiles[0].length, height: src.tiles.length, tiles: src.tiles, collision: src.collision,
    cells: GAME_DATA.roomsData.cells, blockingCells: blocking, bgKey: "room_" + id, spawn: { x: sp[0], y: sp[1] }, entry: r.entry || null,
    exit: { x: src.exit[0], y: src.exit[1], to: r.exitTo }, interact: src.interact, decor, hidden: [] };
}
// Overworld shop door (tile 6 at 15,5) leads into the shop.
GAME_DATA.maps.shop.exitText = "roomShopExit"; // v0.4.1 battle_text.md shop_exit
GAME_DATA.maps.starter.doors = [{ x: 15, y: 5, to: "shop" }, { x: 7, y: 4, to: "bedroom" }]; // v0.3.5 house door (tile 8) -> bedroom
GAME_DATA.sprites.images.npc_shopkeeper = "assets/style2/overworld/shopkeeper_walk_48.png";
GAME_DATA.maps.bedroom.entry = GAME_DATA.roomDefs.bedroom.entry = { x: 7, y: 9, facing: "up" }; // entering from the house door: just inside, above the exit
