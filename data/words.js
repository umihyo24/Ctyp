const WORDS_BY_TIER = {
  easy: [
    { text: 'seal', type: 'short' },
    { text: 'combo', type: 'short' },
    { text: 'focus', type: 'short' },
    { text: 'rush', type: 'short' },
    { text: 'guard', type: 'short' },
  ],
  normal: [
    { text: 'typing builds rhythm', type: 'long' },
    { text: 'short lines keep combos alive', type: 'long' },
    { text: 'choose risk for heavy damage', type: 'long' },
    { text: 'stamina matters in long runs', type: 'long' },
  ],
  hard: [
    { text: 'perfect pacing beats pure speed in this battle', type: 'long' },
    { text: 'adaptive builds turn mistakes into strategic openings', type: 'long' },
    { text: 'resource management decides the final boss encounter', type: 'long' },
  ],
};

function pickWord(stage, rng = Math.random) {
  const tier = stage <= 1 ? 'easy' : stage <= 3 ? 'normal' : 'hard';
  const pool = WORDS_BY_TIER[tier];
  return pool[Math.floor(rng() * pool.length)];
}

module.exports = { WORDS_BY_TIER, pickWord };
