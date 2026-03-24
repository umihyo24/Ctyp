const { REWARDS } = require('../data/rewards');

function drawRewards(rng = Math.random, count = 3) {
  const bag = [...REWARDS];
  const picked = [];
  while (picked.length < count && bag.length > 0) {
    const idx = Math.floor(rng() * bag.length);
    picked.push(bag.splice(idx, 1)[0]);
  }
  return picked;
}

async function chooseReward(io, player, runState, rng = Math.random) {
  const options = drawRewards(rng, 3);
  io.print('\n=== 報酬選択 ===');
  options.forEach((r, i) => io.print(`[${i + 1}] ${r.name} - ${r.description}`));
  const ans = await io.ask('reward> ');
  const idx = Number(ans) - 1;
  const picked = options[idx] || options[0];
  picked.apply(player, runState);
  io.print(`獲得: ${picked.name}`);
}

module.exports = { chooseReward };
