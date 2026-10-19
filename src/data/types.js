// Type chart: chart[attacker][defender] = multiplier (default 1).
// DESIGN.md v0.2: Gale>Ember>Stone>Gale loop, 2x for the winner and 0.5x the other way; 1x vs other types. Neutral 1x vs all.
// Pre-existing Tide/Bloom edges retained (doc doesn't mention them).
window.GAME_DATA = window.GAME_DATA || {};
GAME_DATA.types = {
  list: ["Neutral", "Gale", "Ember", "Tide", "Bloom", "Stone"],
  colors: { Neutral: "#bbbbbb", Gale: "#9fd8f0", Ember: "#e8603c", Tide: "#3c8ce8", Bloom: "#4cbf52", Stone: "#a08a6a" },
  chart: {
    Gale:  { Ember: 2, Stone: 0.5 },
    Ember: { Stone: 2, Gale: 0.5, Bloom: 2, Tide: 0.5, Ember: 0.5 },
    Tide:  { Ember: 2, Stone: 2, Bloom: 0.5, Tide: 0.5 },
    Bloom: { Tide: 2, Stone: 2, Ember: 0.5, Bloom: 0.5 },
    Stone: { Gale: 2, Ember: 0.5, Bloom: 0.5 }
  }
};
