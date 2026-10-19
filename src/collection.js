// Card collection (DESIGN v0.4 §13 entries: {uid, cardId, holo, level, xp, copies}).
// Same cardId + same holo flag stacks into copies. Duplicate rules (Card XP / sell / holo upgrade, §10) come with pack opening (M2).
class Collection {
  constructor(list) { this.list = Array.isArray(list) ? list.filter(e => e && GAME_DATA.cards[e.cardId]).map(e => ({ uid: String(e.uid), cardId: e.cardId, holo: !!e.holo, level: e.level | 0 || 1, xp: e.xp | 0, copies: Math.max(1, e.copies | 0) })) : []; }
  nextUid() { let n = 0; for (const e of this.list) { const m = /^c(\d+)$/.exec(e.uid); if (m) n = Math.max(n, +m[1]); } return "c" + (n + 1); }
  add(cardId, holo = false) {
    if (!GAME_DATA.cards[cardId]) throw new Error("Unknown card id: " + cardId);
    const e = this.list.find(x => x.cardId === cardId && x.holo === !!holo);
    if (e) { e.copies++; return e; }
    const n = { uid: this.nextUid(), cardId, holo: !!holo, level: 1, xp: 0, copies: 1 }; this.list.push(n); return n;
  }
  removeCopy(uid) { const i = this.list.findIndex(x => x.uid === uid); if (i < 0) return false; if (--this.list[i].copies <= 0) this.list.splice(i, 1); return true; }
  count(cardId) { return this.list.filter(e => !cardId || e.cardId === cardId).reduce((s, e) => s + e.copies, 0); }
  // Binder order: card catalog order, non-holo before holo
  sorted() { const ids = Object.keys(GAME_DATA.cards); return this.list.slice().sort((a, b) => ids.indexOf(a.cardId) - ids.indexOf(b.cardId) || a.holo - b.holo); }
  toJSON() { return this.list; }
}
window.Collection = Collection;
