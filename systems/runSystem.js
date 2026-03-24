const { pickEnemy } = require('../data/enemies');
const { pickWord } = require('../data/words');
const { evaluateTyping, renderTargetWithHint } = require('./inputSystem');
const { processPlayerTurn, processEnemyTurn } = require('./combatSystem');
const { chooseReward } = require('./rewardSystem');
const { applyMetaBonuses, completeRun } = require('./metaSystem');

function createPlayer(buildType) {
  const base = {
    name: 'Baby Seal',
    level: 1,
    exp: 0,
    maxHp: 110,
    hp: 110,
    maxFocus: 100,
    focus: 100,
    maxStamina: 100,
    stamina: 100,
    combo: 0,
    consecutiveMisses: 0,
    skills: ['burst'],
    perks: { comboRate: 0, missMitigation: 0, longBonus: 0 },
    status: { exposed: 0, confused: 0, shield: 0 },
    stats: { atk: 12, def: 6 },
  };

  if (buildType === 'speed') {
    base.stats.atk += 1;
    base.maxStamina += 15;
    base.stamina = base.maxStamina;
    base.perks.comboRate += 0.03;
  } else if (buildType === 'power') {
    base.stats.atk += 4;
    base.maxFocus -= 10;
    base.focus = base.maxFocus;
    base.perks.longBonus += 0.2;
  } else if (buildType === 'stable') {
    base.maxHp += 20;
    base.hp = base.maxHp;
    base.perks.missMitigation += 0.15;
    base.skills.push('guard');
  } else {
    base.skills.push('guard');
  }

  return base;
}

function gainExp(player, amount) {
  player.exp += amount;
  const logs = [];
  while (player.exp >= player.level * 40) {
    player.exp -= player.level * 40;
    player.level += 1;
    player.maxHp += 10;
    player.hp = Math.min(player.maxHp, player.hp + 10);
    player.stats.atk += 2;
    player.stats.def += 1;
    player.maxFocus += 4;
    player.focus = Math.min(player.maxFocus, player.focus + 4);
    logs.push(`🎉 LEVEL UP! Lv.${player.level}`);
  }
  return logs;
}

async function battleStage(io, player, enemy, stage) {
  io.print(`\n=== Stage ${stage} vs ${enemy.name} ===`);

  let turn = 1;
  while (player.hp > 0 && enemy.hp > 0) {
    io.print(`\nTurn ${turn}`);
    io.print(`Player HP:${player.hp}/${player.maxHp} Focus:${player.focus} Stamina:${player.stamina} Combo:${player.combo}`);
    io.print(`Enemy HP:${enemy.hp}`);

    const word = pickWord(stage);
    io.print(`Type: ${renderTargetWithHint(word.text)}`);
    io.print('Skill keyword: burst / guard / recover');

    const start = Date.now();
    const typed = await io.ask('> ');
    const elapsedMs = Date.now() - start;

    const result = evaluateTyping({ target: word, typed, elapsedMs });
    const playerLogs = processPlayerTurn({ player, enemy, typingResult: result });
    playerLogs.forEach((line) => io.print(line));

    if (enemy.hp <= 0) break;

    io.print(processEnemyTurn({ player, enemy }));
    if (player.stamina <= 0) {
      const exhaust = 5;
      player.hp = Math.max(0, player.hp - exhaust);
      io.print(`🥵 スタミナ切れで ${exhaust} ダメージ`);
    }
    turn += 1;
  }

  return player.hp > 0;
}

async function runGame(io, meta) {
  io.print('=== Typing Roguelite RPG ===');
  io.print(`Legacy Points: ${meta.legacyPoints} | Best Stage: ${meta.bestStage}`);
  io.print('[1] speed [2] power [3] combo [4] stable');
  const raw = await io.ask('build> ');
  const map = { '1': 'speed', '2': 'power', '3': 'combo', '4': 'stable' };
  const build = map[raw] || 'combo';

  const player = createPlayer(build);
  applyMetaBonuses(player, meta);
  const runState = { unlockPool: ['guard', 'recover'] };
  const maxStage = 4;

  for (let stage = 1; stage <= maxStage; stage += 1) {
    const enemy = pickEnemy(stage);
    const won = await battleStage(io, player, enemy, stage);
    if (!won) {
      const legacy = completeRun(meta, { victory: false, clearedStage: stage - 1 });
      return { victory: false, stage: stage - 1, legacy };
    }

    const expLogs = gainExp(player, stage * 26);
    expLogs.forEach((line) => io.print(line));

    if (stage < maxStage) {
      await chooseReward(io, player, runState);
    }
  }

  const legacy = completeRun(meta, { victory: true, clearedStage: maxStage });
  return { victory: true, stage: maxStage, legacy };
}

module.exports = { runGame };
