const { updateCombo, comboMultiplier } = require('./comboSystem');
const { tryActivateSkill } = require('./skillSystem');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function applyMissPenalty(player, enemy) {
  const mitigation = 1 - player.perks.missMitigation;
  player.focus = clamp(player.focus - Math.round(10 * mitigation), 0, player.maxFocus);
  player.stamina = clamp(player.stamina - Math.round(8 * mitigation), 0, player.maxStamina);
  player.status.exposed = Math.min(player.status.exposed + 1, 3);
  if (player.consecutiveMisses >= 2) {
    player.status.confused = 1;
  }
  return Math.round(enemy.traits.missPunish * (1 + player.status.exposed * 0.15));
}

function calculateTypedDamage({ player, enemy, result }) {
  if (!result.exact) return 0;

  const speedFactor = clamp(result.cps / 5.5, 0.7, 1.7);
  const accFactor = 0.7 + result.accuracy * 0.6;
  const resourceFactor = 0.8 + (player.focus / player.maxFocus) * 0.4;
  const comboFactor = comboMultiplier(player);
  const longFactor = result.wordType === 'long' ? 1.35 + player.perks.longBonus : 0.92;

  const enemyResistance = result.wordType === 'short' ? 1 - enemy.traits.antiShort : 1 - enemy.traits.antiLong;
  const reduced = player.stats.atk * speedFactor * accFactor * resourceFactor * comboFactor * longFactor * enemyResistance;

  return Math.max(1, Math.round(reduced - enemy.defense * 0.45));
}

function processPlayerTurn({ player, enemy, typingResult }) {
  const logs = [];
  const skillTry = tryActivateSkill({ player, typed: typingResult.typed });
  if (skillTry.activated) {
    const { effect, skill } = skillTry;
    player.combo += effect.addCombo || 0;
    if (effect.addShield) player.status.shield = effect.addShield;
    if (effect.cleanseExposed) player.status.exposed = 0;
    if (effect.restoreFocus) player.focus = clamp(player.focus + effect.restoreFocus, 0, player.maxFocus);
    if (effect.selfHeal) player.hp = clamp(player.hp + effect.selfHeal, 0, player.maxHp);
    const dealt = effect.fixedDamage || 0;
    enemy.hp -= dealt;
    logs.push(`✨ Skill ${skill.name} 発動! ${dealt} ダメージ`);
    return logs;
  }

  updateCombo(player, typingResult);
  if (!typingResult.exact) {
    const stagger = applyMissPenalty(player, enemy);
    logs.push(`❌ ミス! 防御低下(露出:${player.status.exposed}) / 混乱:${player.status.confused}`);
    if (stagger > 0) {
      player.hp = clamp(player.hp - stagger, 0, player.maxHp);
      logs.push(`⚠ ミス反撃で ${stagger} ダメージ`);
    }
    return logs;
  }

  player.consecutiveMisses = 0;
  player.status.exposed = Math.max(0, player.status.exposed - 1);
  const dealt = calculateTypedDamage({ player, enemy, result: typingResult });
  enemy.hp = Math.max(0, enemy.hp - dealt);

  const focusGain = typingResult.wordType === 'short' ? 5 : -6;
  const staminaGain = typingResult.wordType === 'short' ? -3 : -9;
  player.focus = clamp(player.focus + focusGain, 0, player.maxFocus);
  player.stamina = clamp(player.stamina + staminaGain, 0, player.maxStamina);

  logs.push(`✅ HIT ${dealt} dmg | combo x${player.combo} | cps:${typingResult.cps.toFixed(1)}`);
  return logs;
}

function processEnemyTurn({ player, enemy }) {
  if (enemy.hp <= 0) return '敵は倒れている。';

  const base = enemy.atk;
  const exposedFactor = 1 + player.status.exposed * 0.18;
  const confusionFactor = player.status.confused ? 1.2 : 1;
  const shieldFactor = player.status.shield ? 1 - player.status.shield : 1;

  const damage = Math.max(1, Math.round((base - player.stats.def * 0.35) * exposedFactor * confusionFactor * shieldFactor));
  player.hp = clamp(player.hp - damage, 0, player.maxHp);

  player.status.shield = 0;
  player.status.confused = Math.max(0, player.status.confused - 1);

  return `👾 ${enemy.name} の攻撃: ${damage} ダメージ`;
}

module.exports = { processPlayerTurn, processEnemyTurn };
