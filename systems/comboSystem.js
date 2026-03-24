function updateCombo(player, typingResult) {
  if (typingResult.exact && typingResult.wordType === 'short') {
    player.combo += 1;
  } else if (typingResult.exact) {
    player.combo = Math.max(1, player.combo);
  } else {
    player.combo = 0;
    player.consecutiveMisses += 1;
  }
}

function comboMultiplier(player) {
  return 1 + player.combo * (0.1 + player.perks.comboRate);
}

module.exports = { updateCombo, comboMultiplier };
