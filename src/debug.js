// Debug panel (DESIGN.md "Debug Tools"). Toggle with ` (Backquote) or open with ?debug=1.
// While open, game updates pause and these keys apply:
//  1/2: party[0] level -/+   E: force encounter (species cycled with S, level with [ ])
//  C: toggle show bond/stamina in battle  R: toggle rand=1.0 damage  F: fixed RNG seed (42) on/off
//  H: full heal party         I: give 3 Potions   B: set wild bond to 100
//  v0.3.0: G +100 coins, P +1 Basic Pack, K add a random card to the binder. E uses a loaner Lv5 Brazzle if the
//  legacy party is empty (old 1v1 battle is legacy, reachable from here only).
const Debug = {
  open: false, enabled: false, showBond: true, speciesIdx: 0, level: 5, seeded: false, msg: "",
  init(target) {
    try { this.open = this.enabled = /[?&]debug=1/.test(location.search); } catch (e) {}
    target.addEventListener("keydown", e => {
      if (e.code === "Backquote") { this.open = !this.open; return; }
      if (this.open) this.handle(e.code);
    });
  },
  handle(code) {
    const g = window.game; if (!g) return;
    if (code === "KeyG") { g.inventory.addMoney(100); this.msg = "+100 coins"; return; }
    if (code === "KeyP") { g.inventory.addPack("basic"); this.msg = "+1 Basic Pack"; return; }
    if (code === "KeyK") { const ids = Object.keys(GAME_DATA.cards), id = ids[Math.floor(Math.random() * ids.length)]; g.collection.add(id, false); this.msg = "+card " + id; return; }
    if (!g.party.length) { if (code !== "KeyE") return; g.party = [makeCreature("brazzle", 5)]; }
    const sp = Object.keys(GAME_DATA.creatures), lead = g.party[0];
    if (code === "Digit1" || code === "Digit2") { setLevel(lead, lead.level + (code === "Digit2" ? 1 : -1)); this.msg = lead.name + " -> Lv" + lead.level + " (xp " + lead.xp + ")"; }
    else if (code === "KeyS") this.speciesIdx = (this.speciesIdx + 1) % sp.length;
    else if (code === "BracketLeft") this.level = Math.max(1, this.level - 1);
    else if (code === "BracketRight") this.level = Math.min(Formulas.LEVEL_CAP, this.level + 1);
    else if (code === "KeyE") { this.forceEncounter(sp[this.speciesIdx], this.level); this.open = false; }
    else if (code === "KeyC") this.showBond = !this.showBond;
    else if (code === "KeyB" && g.battle) { g.battle.bond = 100; g.battle.bondLocked = false; this.msg = "Bond set to 100"; }
    else if (code === "KeyR") Formulas.fixedDamageRand = !Formulas.fixedDamageRand;
    else if (code === "KeyF") { this.seeded = !this.seeded; Formulas.seed(this.seeded ? 42 : null); }
    else if (code === "KeyH") { g.party.forEach(c => { c.hp = c.maxHp; c.status = null; }); this.msg = "Party healed"; }
    else if (code === "KeyI") { g.inventory.add("potion", 3); this.msg = "Items given"; }
  },
  forceEncounter(species, level) { const g = window.game; if (g.state === "battle" || g.state === "intro") return; g.menu = null; g.startBattle(makeCreature(species, level)); },
  update() {},
  render(g, ctx) {
    const b = g.battle;
    if (this.showBond && (this.open || this.enabled) && b) {
      ctx.fillStyle = "rgba(0,0,0,0.7)"; ctx.fillRect(440, 4, 276, 22); ctx.fillStyle = "#ff0"; ctx.font = "12px monospace";
      ctx.fillText("bond=" + b.bond + (b.bondLocked ? " (locked)" : "") + " stamina=" + b.stamina + " cheer=" + b.cheerTurns, 446, 19);
    }
    if (!this.open) return;
    const sp = Object.keys(GAME_DATA.creatures), lead = g.party[0] || { name: "(none)", level: "-" };
    const lines = ["DEBUG (` to close)", "1/2 lead level: " + lead.name + " Lv" + lead.level, "S species: " + sp[this.speciesIdx] + "  [ ] lv: " + this.level, "E force encounter",
      "C show bond: " + this.showBond + "  B bond=100", "R rand=1.0 dmg: " + Formulas.fixedDamageRand, "F seed 42: " + this.seeded, "H full heal   I give items", "G +100c  P +Basic Pack  K +card", this.msg];
    ctx.fillStyle = "rgba(20,0,40,0.85)"; ctx.fillRect(8, 8, 330, 20 + lines.length * 18); ctx.fillStyle = "#0f0"; ctx.font = "13px monospace";
    lines.forEach((l, i) => ctx.fillText(l, 16, 26 + i * 18));
  }
};
window.Debug = Debug;
