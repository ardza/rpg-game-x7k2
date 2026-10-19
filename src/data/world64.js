window.GAME_DATA = window.GAME_DATA || {};
// v0.4.7 world at native 64px tiles (Artist: assets/style2/tiles64, assets/style2/overworld64/overworld64.json).
// GAME_DATA.world64Spec is a verbatim copy of overworld64.json (file:// can't fetch JSON); tests/headless.js checks it matches.
// All tile sizes / anchors come from here. Maps without 64px art (rooms) scale their 48px art by tile / legacyTile (temporary fallback).
GAME_DATA.world64Spec = {"tile":64,"person":{"cell":[64,80],"draw":"x = tx*64, y = ty*64 - 16 (feet on tile bottom)","sheet":"3 cols (f0 step, f1 together, f2 step) x 4 rows (down, up, left, right)"},"buildings":[{"id":"house1","file":"overworld64/building_house1_384x176.png","footprint":{"x":5,"y":3,"w":6,"h":2},"w":384,"h":176,"overhangUp":48,"drawAt":"x = fx*64 - camX, y = fy*64 - 48 - camY","sortY":4},{"id":"pack_shack","file":"overworld64/building_pack_shack_320x304.png","footprint":{"x":13,"y":2,"w":5,"h":4},"w":320,"h":304,"overhangUp":48,"drawAt":"x = fx*64 - camX, y = fy*64 - 48 - camY","sortY":5},{"id":"house2","file":"overworld64/building_house2_256x176.png","footprint":{"x":21,"y":3,"w":4,"h":2},"w":256,"h":176,"overhangUp":48,"drawAt":"x = fx*64 - camX, y = fy*64 - 48 - camY","sortY":4},{"id":"cafe","file":"overworld64/building_cafe_320x176.png","footprint":{"x":26,"y":3,"w":5,"h":2},"w":320,"h":176,"overhangUp":48,"drawAt":"x = fx*64 - camX, y = fy*64 - 48 - camY","sortY":4},{"id":"hustle_hq","file":"overworld64/building_hustle_hq_256x304.png","footprint":{"x":22,"y":8,"w":4,"h":4},"w":256,"h":304,"overhangUp":48,"drawAt":"x = fx*64 - camX, y = fy*64 - 48 - camY","sortY":11}],"lamp_post":{"file":"overworld64/lamp_post_64x128.png","footprint":"1x1","draw":"y = ty*64 - 64","solid":true,"note":"optional decor; mock uses (12,3)"},"drawOrder":"ground tiles -> y-sorted pass of buildings, decor, NPCs, player by bottom tile row (ties: buildings first) -> UI"};
// v0.4.7 rooms: GAME_DATA.rooms64Data is a verbatim copy of assets/style2/rooms/rooms_64.json (11x8 rooms, 704x512, centred, no scroll).
GAME_DATA.rooms64Data = {"tileSize":64,"tileset":"tiles64/interior_64.png","cells":["floor_wood","floor_rug","floor_tile","wall","wall_window","wall_poster","door","counter","counter_till","shelf_packs","bed_head","bed_foot","desk","desk_laptop","ring_light","plant","box_pile","mat_exit","shelf_soldout"],"blocking":[3,4,5,7,8,9,10,11,12,13,14,15,16,18],"note":"Plain style2 (no holo). 11x8 rooms = 704x512, centered on 720x528 with 8px margins (no scroll).","roomSize":{"w":11,"h":8,"px":[704,512],"canvas":[720,528],"margin":8},"bedroom":{"tiles":[[3,3,3,5,3,4,4,3,5,3,3],[10,0,0,0,0,0,12,13,14,0,15],[11,0,0,0,0,0,0,0,0,0,0],[0,0,0,1,1,1,1,1,0,0,16],[0,0,0,1,1,1,1,1,0,0,0],[0,0,0,1,1,1,1,1,0,0,0],[15,0,0,0,0,0,0,0,0,0,0],[3,3,3,3,3,6,3,3,3,3,3]],"collision":[[1,1,1,1,1,1,1,1,1,1,1],[1,0,0,0,0,0,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,1,1,1,0,1,1,1,1,1]],"spawn":[5,6],"exit":[5,7],"interact":[{"key":"bed","tile":[0,1],"also":[[0,2]],"trigger":"face"},{"key":"pc","tile":[7,1],"trigger":"face"},{"key":"poster","tile":[3,0],"also":[[8,0]],"trigger":"face"}],"npc_mom":[2,3],"rows":["WWWPWNNWPWW","H.....KLO.p","F..........","...rrrrr..B","...rrrrr...","...rrrrr...","p..........","WWWWWDWWWWW"]},"shop":{"tiles":[[3,3,3,5,3,3,3,3,5,3,3],[9,9,9,2,2,2,9,9,9,18,9],[2,2,2,2,2,2,2,2,2,2,2],[2,2,7,7,7,8,7,7,7,2,2],[2,2,2,2,2,2,2,2,2,2,2],[9,9,2,2,2,2,2,2,9,9,2],[16,2,2,2,2,2,2,2,2,15,2],[3,3,3,3,3,17,3,3,3,3,3]],"collision":[[1,1,1,1,1,1,1,1,1,1,1],[1,1,1,0,0,0,1,1,1,1,1],[1,0,0,0,0,0,0,0,0,0,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,1,1,1],[1,0,0,0,0,0,0,0,0,1,1],[1,1,1,1,1,0,1,1,1,1,1]],"shopkeeper_spot":[5,2],"exit":[5,7],"interact":[{"key":"shop_entry","tile":[5,6],"trigger":"enter"},{"key":"shelf_soldout","tile":[9,1],"trigger":"face"}],"rows":["WWWPWWWWPWW","SSStttSSSXS","ttttttttttt","ttCCC$CCCtt","ttttttttttt","SSttttttSSt","Bttttttttpt","WWWWWEWWWWW"]},"changelog_vs_rooms_48":{"bedroom":{"size":"15x11 -> 11x8 (720x528 scroll -> 704x512 no-scroll, 8px margin)","spawn":{"was":[7,8],"now":[5,6]},"exit_door_tile":{"was":[7,10],"now":[5,7]},"entry_from_overworld":{"was":[7,9],"now":[5,6],"note":"maps.bedroom.entry / roomDefs.bedroom.entry"},"exitTo_overworld":{"unchanged":{"map":"starter","x":7,"y":5},"note":"overworld house door still (7,4); only the interior landing tile changes"},"interact_bed":{"was":[0,1],"also_was":[[0,2]],"now":[0,1],"also_now":[[0,2]]},"interact_pc":{"was":[8,1],"now":[7,1],"note":"desk_laptop cell"},"interact_poster":{"was":[[3,0],[9,0]],"now":[[3,0],[8,0]]},"npc_mom":{"was":null,"now":[2,3],"note":"NPC stand tile (not in rooms_48.json; was implied by preview)"},"ring_light_cell":{"now":[8,1],"note":"visual with desk; interact via pc at [7,1]"},"bg":{"was":"rooms/bedroom_720x528.png","now":"rooms/bedroom_704x512.png"}},"shop":{"size":"15x11 -> 11x8","shopkeeper_spot":{"was":[6,2],"now":[5,2]},"exit_mat_tile":{"was":[7,10],"now":[5,7]},"entry_from_overworld":{"was":[7,9],"now":[5,6],"note":"roomDefs.shop.entry"},"exitTo_overworld":{"unchanged":{"map":"starter","x":15,"y":6}},"interact_shop_entry":{"was":[7,9],"now":[5,6]},"interact_shelf_soldout":{"was":[13,1],"now":[9,1]},"npc_reach":{"was":[[6,3]],"now":[[5,3]],"note":"face the counter from below the shopkeeper"},"bg":{"was":"rooms/shop_interior_720x528.png","now":"rooms/shop_interior_704x512.png"}}}};
// Holo interior set manifest (cells/tileSize copied from the holo set's interior_64 JSON manifest, dev only; headless checks it matches).
GAME_DATA.interiorHoloManifest = {"tileSize":64,"cells":["floor_wood","floor_rug","floor_tile","wall","wall_window","wall_poster","door","counter","counter_till","shelf_packs","bed_head","bed_foot","desk","desk_laptop","ring_light","plant","box_pile","mat_exit","shelf_soldout"]};
{ const S2 = "assets/style2/", W = GAME_DATA.world64Spec, I = GAME_DATA.sprites.images;
  GAME_DATA.world = {
    tile: W.tile, legacyTile: GAME_DATA.tileset.tileSize, // 48px art (rooms, missing cells) is drawn at tile / legacyTile = 1.33x
    tileset: { src: S2 + "tiles64/tileset_64.png", tileSize: W.tile, columns: 44 }, // same 44 cells / order as tileset_48 (tiles64/tileset_64.json)
    legacyTileset: GAME_DATA.tileset,
    // Cells whose 64px art isn't final yet (Artist: circuit-line exit roads). Drawn from tiles64/<name>_64.png once that file loads
    // (optional sprite "tile64_<name>"), else the 48px cell scaled up. No code change needed when the file lands.
    pendingCells: { 39: "path_v", 40: "path_h" },
    nativeMaps: ["starter", "bedroom", "shop"], // maps with 64px art (v0.4.7: rooms too); anything else would use 48px art scaled up
    // Interior tile set for the rooms: "holo" (light holo touches, Director 10:32) or "plain". One-line switch:
    interior: { style: "holo", sets: { plain: "tiles64/interior_64.png", holo: "tiles64/holo/interior_64.png" } },
    // Director 10:52: overrides on top of rooms_64.json (Artist's file untouched). Bedroom poster [8,0] sits above the solid ring light, so it's dropped; [3,0] stays.
    roomOverrides: { bedroom: { dropInteractTiles: { poster: [[8, 0]] } } },
    roomGrid: "11x8", // saved with the game; a save from another room grid (v0.4.6 = 15x11) lands on the room's spawn
    person: { w: W.person.cell[0], h: W.person.cell[1], lift: W.person.cell[1] - W.tile, cols: 3, idle: 1, rows: { down: 0, up: 1, left: 2, right: 3 } }, // y = ty*64 - 16
    buildings: { starter: W.buildings.map(b => ({ id: b.id, key: "bld_" + b.id, fx: b.footprint.x, fy: b.footprint.y, fw: b.footprint.w, fh: b.footprint.h, w: b.w, h: b.h, up: b.overhangUp, sortY: b.sortY })) },
    groundUnderBuildings: 0, // tileset cell drawn under a building footprint (grass)
    coin: 32, marker: 64, sparkleKey: "sparkle_64",
    // path_trace_<side>: on a path tile whose n/s/e/w neighbour is grass / tall grass
    pathTrace: { path: ["path", "path_exit_arrow"], /* not path_v / path_h: the circuit-line road art has its own edges (no doubled glow) */ grass: ["grass", "tall_grass", "tall_grass_b", "tall_grass_edge_n"], key: "path_trace_" },
    lamp: { w: 64, h: 128, x: 12, y: 3 }, // Director-approved street lamp (one solid decor entry)
    nameTag: { font: 16, padX: 12, h: 26, overlap: 6, x: 32, xBust: 132 } // dialog speaker tab (v047 mock)
  };
  const WD = GAME_DATA.world;
  for (const b of WD.buildings.starter) I[b.key] = S2 + W.buildings.find(x => x.id === b.id).file;
  for (const name of Object.values(WD.pendingCells)) I["tile64_" + name] = S2 + "tiles64/" + name + "_64.png";
  for (const s of ["n", "s", "e", "w"]) I[WD.pathTrace.key + s] = S2 + "tiles64/path_trace_" + s + "_64.png";
  I[WD.sparkleKey] = S2 + "tiles64/card_sparkle_64.png"; I.deco_lamp = S2 + W.lamp_post.file;
  // people: 64x80 walk sheets, same layout as the 48px ones
  for (const [k, n] of Object.entries({ player: "player", npc_mom: "mom", npc_dad: "dad", npc_ricky: "ricky", npc_unboxer: "unboxer", npc_thorne: "thorne", npc_pell: "pell", npc_shopkeeper: "shopkeeper" })) I[k] = S2 + "overworld64/" + n + "_walk_64x80.png";
  GAME_DATA.sprites.player = Object.assign({}, GAME_DATA.sprites.player, { src: I.player, cell: null, person: true });
  I.deco_sign = S2 + "tiles64/sign_64.png"; I.deco_gig_cam = S2 + "tiles64/gig_cam_64.png";
  // creature markers (hidden cards + roaming groups): overworld64/<id>_map_64.png for every card
  for (const id of Object.keys(GAME_DATA.cards)) { GAME_DATA.cardMapSprite[id] = S2 + "overworld64/" + id + "_map_64.png"; I["cardmap_" + id] = GAME_DATA.cardMapSprite[id]; }
  // --- v0.4.7 rooms from rooms_64.json (every changelog_vs_rooms_48 entry applied from the data; door targets to town unchanged)
  { const RD = GAME_DATA.rooms64Data, CL = RD.changelog_vs_rooms_48, IN = WD.interior, HM = GAME_DATA.interiorHoloManifest;
    const holoOk = HM.tileSize === RD.tileSize && JSON.stringify(HM.cells) === JSON.stringify(RD.cells); // same cells, same order -> usable
    IN.live = IN.style === "holo" && !holoOk ? "plain" : IN.style; IN.fallback = IN.live !== IN.style ? "holo set doesn't match the plain cell order" : null;
    IN.tileSize = RD.tileSize; I.interior = S2 + IN.sets[IN.live]; I.interior_plain = S2 + IN.sets.plain; // renderRoom falls back to plain if the live atlas fails
    const same = (a0, b0) => a0[0] === b0[0] && a0[1] === b0[1], dropTiles = (list, drop) => !drop ? list : list.map(it => { const d = drop[it.key]; if (!d) return it;
      const tiles = [it.tile].concat(it.also || []).filter(t => !d.some(x => same(x, t))); return tiles.length ? Object.assign({}, it, { tile: tiles[0], also: tiles.slice(1) }) : null; }).filter(Boolean);
    for (const id of ["bedroom", "shop"]) { const m = GAME_DATA.maps[id], src = RD[id], c = CL[id], def = GAME_DATA.roomDefs[id], sp = src.spawn || c.entry_from_overworld.now;
      Object.assign(m, { width: RD.roomSize.w, height: RD.roomSize.h, tiles: src.tiles, collision: src.collision, cells: RD.cells, blockingCells: new Set(RD.blocking),
        spawn: { x: sp[0], y: sp[1] }, exit: { x: src.exit[0], y: src.exit[1], to: def.exitTo }, interact: dropTiles(src.interact, (WD.roomOverrides[id] || {}).dropInteractTiles), roomPx: RD.roomSize.px });
      m.entry = def.entry = { x: c.entry_from_overworld.now[0], y: c.entry_from_overworld.now[1], facing: (def.entry && def.entry.facing) || "up" };
      def.bg = I["room_" + id] = S2 + c.bg.now;
      if (src.shopkeeper_spot) { const k = m.decor.find(d => d.id === def.npc.id); k.x = src.shopkeeper_spot[0]; k.y = src.shopkeeper_spot[1]; k.reach = def.npc.reach = c.npc_reach.now; } }
    // Mom's intro: in through the bedroom door, round the player (on the spawn just above the door), to her stand tile npc_mom
    const B = RD.bedroom, MW = GAME_DATA.momWalkIn, d0 = B.exit, st = B.npc_mom;
    MW.path = [[d0[0], d0[1]], [d0[0] - 1, d0[1] - 1], [st[0], d0[1] - 1], [st[0], st[1]]]; MW.from = { x: d0[0], y: d0[1] }; MW.to = { x: st[0], y: st[1] };
    MW.stepMs = 260; MW.ms = MW.stepMs * MW.path.reduce((a0, p, i) => i ? a0 + Math.max(Math.abs(p[0] - MW.path[i - 1][0]), Math.abs(p[1] - MW.path[i - 1][1])) : 0, 0); // tiles walked x step time
    MW.playerFacing = "left"; MW.endRow = 3; /* faces right, toward the player */ }
  // speaker names for the dialog name tag (decor id -> name)
  const SP = { ricky: "Ring Light Ricky", unboxer: "Unboxing Kid", mom: "Mom", dad: "Dad", thorne: "Thorne", pell: "Mrs. Pell", gig_cam: "Ring Light Ricky", shopkeeper: "Shopkeeper" };
  const SHORT = { ricky: "Ricky", gig_cam: "Ricky", unboxer: "Unboxer" }; // Story: only if the full name would clip the tab
  for (const [mid, m] of Object.entries(GAME_DATA.maps)) for (const d of m.decor || []) {
    if (SP[d.id]) { d.name = SP[d.id]; if (SHORT[d.id]) d.shortName = SHORT[d.id]; }
    if (d.cell) { d.person = true; delete d.cell; } // people use the 64x80 sheets (world.person)
    if (d.w) { d.w = WD.tile; d.h = WD.tile; } // sign / gig cam: 64px tiles
    if (d.group) { // roaming groups show their creature (first member's card; a person's slot -> the creature they send)
      const m0 = GAME_DATA.enemyGroups[d.group].members[0][0], E = GAME_DATA.enemies[m0];
      d.card = E.person ? E.sends : m0.replace(/^card_/, ""); d.sprite = "cardmap_" + d.card; delete d.person; d.w = d.h = WD.marker; }
  }
  GAME_DATA.momWalkIn.person = true; delete GAME_DATA.momWalkIn.cell;
  GAME_DATA.maps.starter.decor.push({ id: "lamp", sprite: "deco_lamp", x: WD.lamp.x, y: WD.lamp.y, w: WD.lamp.w, h: WD.lamp.h, solid: true, color: "#2a3a4a" });
  GAME_DATA.optionalSprites = new RegExp((GAME_DATA.optionalSprites ? GAME_DATA.optionalSprites.source + "|" : "") + "^tile64_");
}
