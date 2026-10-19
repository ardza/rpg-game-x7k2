// Pause menu (frame + cursor from v0.2.1): Binder, Bag, Shop, Save, Close.
// Binder lists owned cards (Z opens a pack, v0.3.3); Bag: Z on a pack opens it; Shop: BUY / SELL / TRADE-IN.
const CardDraw = {
  // 120x168 card at (x,y) scaled by k: per-rarity frame (transparent art window) over art at the art window, holo overlay on top.
  // Fallbacks: empty plain/gem/legendary frame, then colored rects.
  frameKey(c) { return Sprites.get("frame_" + c.rarity) ? "frame_" + c.rarity : "frame_" + GAME_DATA.frameForRarity[c.rarity]; },
  card(ctx, cardId, holo, x, y, k = 1) {
    const c = GAME_DATA.cards[cardId], r = GAME_DATA.rarities[c.rarity], W = 120 * k, H = 168 * k, A = GAME_DATA.cardArtWindow;
    const fk = this.frameKey(c), hasFrame = !!Sprites.get(fk);
    if (!hasFrame) { ctx.fillStyle = r.frame; ctx.fillRect(x, y, W, H); ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x + 6 * k, y + 6 * k, W - 12 * k, H - 12 * k); }
    else { ctx.fillStyle = "#f6f1e4"; ctx.fillRect(x + A.x * k, y + A.y * k, A.w * k, A.h * k); } // window backing
    if (!Sprites.draw(ctx, "card_" + cardId, x + A.x * k, y + A.y * k, A.w * k, A.h * k)) { ctx.fillStyle = c.color; ctx.fillRect(x + (A.x + 14) * k, y + (A.y + 6) * k, (A.w - 28) * k, (A.h - 12) * k); }
    if (hasFrame) Sprites.draw(ctx, fk, x, y, W, H);
    ctx.fillStyle = "#1a1423"; ctx.font = Math.round(9 * k) + "px monospace"; ctx.fillText(c.name, x + 12 * k, y + 20 * k);
    ctx.font = Math.round(8 * k) + "px monospace"; ctx.fillText(r.name + " · " + c.type, x + 12 * k, y + 116 * k);
    const b = c.base; ctx.fillText(b.hp + "/" + b.atk + "/" + b.def + "/" + b.spd, x + 12 * k, y + 130 * k);
    if (holo && !Sprites.draw(ctx, "frame_holo", x, y, W, H)) { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(x, y + 30 * k, W, 6 * k); ctx.fillRect(x, y + 70 * k, W, 4 * k); }
  }
};
class PauseMenu {
  constructor(game) { this.game = game; this.options = ["Binder", "Bag", "Shop", "Save", "Close"];
    if (window.DEV_CHEATS && window.DevCheats) this.options.splice(4, 0, DevCheats.label); // DEV-CHEATS
    this.idx = 0; this.view = "root"; this.msg = ""; this.closed = false; this.sel = 0; }
  update(dt = 0) {
    const g = this.game;
    if (this.cheat) { if (this.cheat.done) this.cheat = null; return; } // DEV-CHEATS: text box owns input
    if (this.pack) { this.pack.update(dt); if (this.pack.done) { const again = this.pack.again && this.pack.tier; this.pack = null; this.view = "binder"; this.sel = 0;
      if (again) this.openPack(again); else { this.confirmLock = GAME_DATA.packConfirmLockMs; this.needRelease = true; } } return; }
    // Mash fix (v0.3.5 + v0.3.6): after a pack screen closes, Z is ignored for 500ms AND until Z has been released and pressed again.
    if (this.confirmLock > 0) this.confirmLock -= dt * 1000;
    if (this.needRelease && !Input.isDown("a")) this.needRelease = false;
    if ((this.confirmLock > 0 || this.needRelease) && Input.wasPressed("a")) return;
    if (this.confirm) { // v0.3.6: "Open it?" before EVERY pack open from Bag/Binder; No selected by default
      if (Input.wasPressed("up") || Input.wasPressed("down")) this.confirm.choice ^= 1;
      if (Input.wasPressed("b") || Input.wasPressed("menu")) { this.confirm = null; return; }
      if (Input.wasPressed("a")) { const c = this.confirm; this.confirm = null; if (c.choice === 0) this.openPack(c.tier); }
      return;
    }
    if (this.view === "shop") return this.updateShop();
    if (this.view === "binder") {
      const n = g.collection.sorted().length;
      if (Input.wasPressed("b") || Input.wasPressed("menu")) { this.view = "root"; this.msg = ""; return; }
      if (n && Input.wasPressed("up")) this.sel = (this.sel + n - 4) % n;
      if (n && Input.wasPressed("down")) this.sel = (this.sel + 4) % n;
      if (n && Input.wasPressed("left")) this.sel = (this.sel + n - 1) % n;
      if (n && Input.wasPressed("right")) this.sel = (this.sel + 1) % n;
      if (Input.wasPressed("a")) { const t = Packs.firstOwned(g); if (t) this.requestOpen(t); else this.msg = T("packNone"); }
      return;
    }
    if (this.view === "bag") { // v0.3.3: cursor over bag rows; Z on a pack opens it
      const rows = g.inventory.list(), n = rows.length;
      if (Input.wasPressed("b") || Input.wasPressed("menu")) { this.view = "root"; this.msg = ""; return; }
      if (n && Input.wasPressed("up")) this.sel = (this.sel + n - 1) % n;
      if (n && Input.wasPressed("down")) this.sel = (this.sel + 1) % n;
      if (n && Input.wasPressed("a")) { const id = rows[Math.min(this.sel, n - 1)].id; if (/^pack_/.test(id)) this.requestOpen(id.slice(5)); }
      return;
    }
    if (this.view !== "root") { if (Input.wasPressed("a") || Input.wasPressed("b")) { this.view = "root"; this.msg = ""; } return; }
    const n = this.options.length;
    if (Input.wasPressed("up")) this.idx = (this.idx + n - 1) % n;
    if (Input.wasPressed("down")) this.idx = (this.idx + 1) % n;
    if (Input.wasPressed("b") || Input.wasPressed("menu")) { this.closed = true; return; }
    if (Input.wasPressed("a")) {
      const o = this.options[this.idx];
      if (o === "Close") this.closed = true;
      else if (window.DEV_CHEATS && o === DevCheats.label) { this.cheat = new CheatInput(this); return; } // DEV-CHEATS
      else if (o === "Save") { this.view = "msg"; this.msg = Save.save(g) ? T("saved") : T("saveFailed"); }
      else { this.view = o.toLowerCase(); this.sel = 0; this.msg = ""; this.tab = 0; this.offer = null; this.refusals = 0; }
    }
  }
  requestOpen(tier) { this.confirm = { tier, choice: 1 /* No */ }; this.msg = ""; }
  openPack(tier) { const r = Packs.open(this.game, tier); if (r.ok) { this.pack = new PackOpenScreen(this.game, tier, r.cards); this.msg = ""; } return r; }
  // binder_page_720x528: 4x2 pockets 130x186 at x=90+150c, y=50+230r. 8 cards per page; frame fallback when the page is missing.
  renderBinder(ctx) {
    const list = this.game.collection.sorted();
    ctx.fillStyle = "#2a2a3a"; ctx.fillRect(0, 0, 720, 528);
    for (let i = 0; i < 8; i++) { ctx.fillStyle = "#f6f1e4"; ctx.fillRect(90 + 150 * (i % 4), 50 + 230 * Math.floor(i / 4), 130, 186); } // pocket backing (page pockets are see-through)
    Sprites.draw(ctx, "ui_binder", 0, 0, 720, 528);
    ctx.fillStyle = "#f6f1e4"; ctx.font = "16px monospace";
    const page = Math.floor(Math.min(this.sel, Math.max(0, list.length - 1)) / 8), pages = Math.max(1, Math.ceil(list.length / 8));
    ctx.fillText(T("binderTitle") + "  " + this.game.collection.count() + " cards  p" + (page + 1) + "/" + pages, 90, 34);
    { const pk = this.game.inventory.packs, n = Object.values(pk).reduce((x, y) => x + y, 0); ctx.font = "12px monospace";
      ctx.fillText(this.msg || (n ? "Z: open a pack (" + n + " owned)" : ""), 90, 520); ctx.font = "16px monospace"; }
    if (!list.length) { UI.frame(ctx, 120, 200, 480, 80); ctx.fillStyle = UI.textColor(); UI.wrap(ctx, T("binderEmpty"), 440).forEach((l, i) => ctx.fillText(l, 140, 236 + i * 22)); return; }
    this.sel = Math.min(this.sel, list.length - 1);
    list.slice(page * 8, page * 8 + 8).forEach((e, j) => {
      const i = page * 8 + j, px = 90 + 150 * (j % 4), py = 50 + 230 * Math.floor(j / 4), c = GAME_DATA.cards[e.cardId], r = GAME_DATA.rarities[c.rarity];
      CardDraw.card(ctx, e.cardId, e.holo, px + 5, py + 9);
      if (i === this.sel) { ctx.strokeStyle = "#ffd400"; ctx.lineWidth = 4; ctx.strokeRect(px - 2, py - 2, 134, 190); ctx.lineWidth = 1; }
      ctx.fillStyle = "#f6f1e4"; ctx.font = "12px monospace";
      ctx.fillText((i === this.sel ? "> " : "") + c.name, px, py + 202);
      ctx.fillText(r.name + " x" + e.copies + (e.holo ? " *HOLO*" : ""), px, py + 218);
    });
  }
  // Shop: tabs BUY / SELL / TRADE-IN (left/right). Sell: Z shows the offer, Z again accepts. Commons are refused.
  shopRows() { const g = this.game;
    if (this.tab === 0) return Object.keys(GAME_DATA.packs);
    if (this.tab === 1) return g.collection.sorted();
    return ["trade"]; }
  updateShop() {
    const g = this.game, rows = this.shopRows(), n = rows.length;
    if (Input.wasPressed("b") || Input.wasPressed("menu")) { if (this.direct) { this.closed = true; return; } this.view = "root"; this.msg = ""; this.offer = null; return; }
    if (Input.wasPressed("left") || Input.wasPressed("right")) { this.tab = (this.tab + (Input.wasPressed("left") ? 2 : 1)) % 3; this.sel = 0; this.msg = ""; this.offer = null; return; }
    if (n && Input.wasPressed("up")) { this.sel = (this.sel + n - 1) % n; this.msg = ""; this.offer = null; }
    if (n && Input.wasPressed("down")) { this.sel = (this.sel + 1) % n; this.msg = ""; this.offer = null; }
    this.sel = Math.min(this.sel, Math.max(0, n - 1));
    if (!Input.wasPressed("a") || !n) return;
    if (this.tab === 0) { const tier = rows[this.sel], res = g.inventory.buyPack(tier, g.flags);
      this.msg = res === "ok" ? T("shopBought", { pack: GAME_DATA.packs[tier].name }) : res === "poor" ? T("shopPoor") : T("shopLocked"); return; }
    if (this.tab === 1) { const e = rows[this.sel];
      if (Economy.isCommon(e.cardId)) { this.msg = e.holo ? T("shopNoHoloCommon") : T(this.refusals++ % 2 ? "shopNoCommonsAlt" : "shopNoCommons"); this.offer = null; return; }
      if (this.offer !== e.uid) { this.offer = e.uid; this.msg = T("shopSell", { n: Economy.sellValue(e.cardId, e.holo) }); return; }
      const r = Economy.sell(g, e.uid); this.offer = null; this.msg = r.ok ? T("shopSold", { n: r.coins }) : T("shopInDeck"); return; }
    const r = Economy.tradeIn(g); this.msg = r.ok ? T("shopTradeIn") : T("shopTradeShort", { n: r.have });
  }
  renderShop(ctx) { // ui/shop_frame_360x240 ("PACK SHACK") drawn at 1.25x; shopkeeper bust on the left; frame/rect fallbacks
    const g = this.game, X = 210, Y = 40, W = 450, H = 300;
    ctx.fillStyle = "rgba(26,20,35,0.55)"; ctx.fillRect(0, 0, 720, 528);
    if (!Sprites.draw(ctx, "shopkeeper_bust", 20, 150, 192, 192)) { ctx.fillStyle = "#8fe03a"; ctx.fillRect(60, 180, 110, 160); ctx.fillStyle = "#1a1423"; ctx.fillRect(90, 220, 10, 10); ctx.fillRect(130, 220, 10, 10); }
    if (!Sprites.draw(ctx, "ui_shop", X, Y, W, H)) { UI.frame(ctx, X, Y, W, H); ctx.fillStyle = UI.textColor(); ctx.font = "18px monospace"; ctx.fillText(T("shopTitle"), X + 24, Y + 40); }
    ctx.fillStyle = "#1a1423"; ctx.font = "14px monospace";
    const tabs = ["BUY", "SELL", "TRADE-IN"]; tabs.forEach((t, i) => { const tx = X + 24 + i * 90; if (i === this.tab) { ctx.fillStyle = "#ffd400"; ctx.fillRect(tx - 4, Y + 82, t.length * 9 + 8, 20); } ctx.fillStyle = "#1a1423"; ctx.fillText(t, tx, Y + 97); });
    if (!Sprites.draw(ctx, "ui_coin", X + 320, Y + 82, 20, 20)) { ctx.fillStyle = "#e8b530"; ctx.fillRect(X + 322, Y + 84, 16, 16); ctx.fillStyle = "#1a1423"; }
    ctx.fillText(String(g.inventory.money), X + 346, Y + 97);
    const rows = this.shopRows(), top = Math.max(0, Math.min(this.sel - 3, rows.length - 7));
    if (this.tab === 0) rows.forEach((id, i) => { const p = GAME_DATA.packs[id], locked = p.unlockFlag && !g.flags[p.unlockFlag];
      ctx.fillText((i === this.sel ? "> " : "  ") + p.name.padEnd(13) + String(p.price).padStart(4) + "c" + (locked ? " locked" : "") + "  own " + g.inventory.packs[id], X + 24, Y + 128 + i * 22); });
    else if (this.tab === 1) { if (!rows.length) ctx.fillText(T("binderEmpty"), X + 24, Y + 128);
      rows.slice(top, top + 7).forEach((e, j) => { const i = top + j, c = GAME_DATA.cards[e.cardId], v = Economy.sellValue(e.cardId, e.holo);
        ctx.fillStyle = GAME_DATA.rarities[c.rarity].frame; ctx.fillRect(X + 24, Y + 116 + j * 20, 8, 14); ctx.fillStyle = "#1a1423";
        ctx.fillText((i === this.sel ? "> " : "  ") + (c.name + (e.holo ? "*" : "")).padEnd(17) + ("x" + e.copies).padEnd(4) + (v == null ? "no sale" : String(v).padStart(3) + "c"), X + 36, Y + 128 + j * 20); }); }
    else { ctx.fillText("Commons: " + Economy.tradeableCommons(g) + " / " + GAME_DATA.tradeIn.commons, X + 24, Y + 128);
      ctx.fillText("> Trade 50 Commons for 1 Basic Pack", X + 24, Y + 152); ctx.fillText("Traded in so far: " + g.commonsTradedIn, X + 24, Y + 176); }
    if (this.msg) { ctx.font = "12px monospace"; UI.wrap(ctx, this.msg, W - 50).forEach((l, i) => ctx.fillText(l, X + 24, Y + 268 - 16 + i * 15 - (UI.wrap(ctx, this.msg, W - 50).length - 1) * 15)); }
  }
  renderConfirm(ctx) { const c = this.confirm;
    UI.frame(ctx, 160, 200, 400, 130); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace";
    ctx.font = "14px monospace"; UI.wrap(ctx, T("packConfirm", { pack: GAME_DATA.packs[c.tier].name }), 350).forEach((l, i) => ctx.fillText(l, 184, 232 + i * 18)); ctx.font = "16px monospace";
    ["Yes", "No"].forEach((o, i) => ctx.fillText((i === c.choice ? "> " : "  ") + o, 200, 292 + i * 22)); }
  render(ctx) {
    if (this.pack) return this.pack.render(ctx);
    if (this.cheat) { UI.frame(ctx, 400, 20, 240, 440); return this.cheat.render(ctx); } // DEV-CHEATS
    if (this.confirm) { const v = this.view; (v === "binder" ? this.renderBinder(ctx) : UI.frame(ctx, 400, 20, 240, 440)); return this.renderConfirm(ctx); }
    if (this.view === "binder") return this.renderBinder(ctx);
    if (this.view === "shop") return this.renderShop(ctx);
    UI.frame(ctx, 400, 20, 240, 440); ctx.fillStyle = UI.textColor(); ctx.font = "16px monospace";
    if (this.view === "root") { this.options.forEach((o, i) => ctx.fillText((i === this.idx ? "> " : "  ") + o, 424, 64 + i * 28)); ctx.fillText(T("coins", { n: this.game.inventory.money }), 424, 430); }
    else if (this.view === "bag") { const l = this.game.inventory.list(); ctx.fillText(T("coins", { n: this.game.inventory.money }), 410, 60); l.forEach((it, i) => ctx.fillText((i === this.sel ? "> " : "  ") + it.name + " x" + it.n, 410, 88 + i * 24)); if (l.some(it => /^pack_/.test(it.id))) { ctx.font = "12px monospace"; ctx.fillText("Z on a pack: open it", 410, 430); } }
    else ctx.fillText(this.msg, 410, 60);
  }
}
Object.assign(window, { PauseMenu, CardDraw });
