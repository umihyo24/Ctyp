const REWARDS = [
  {
    id: 'atk_boost',
    name: '鋭い爪 (+2 ATK)',
    description: '通常攻撃とスキル火力を底上げ。',
    apply: (player) => {
      player.stats.atk += 2;
    },
  },
  {
    id: 'combo_engine',
    name: '連鎖機構 (コンボ倍率+)',
    description: 'コンボ1あたりの倍率増加。',
    apply: (player) => {
      player.perks.comboRate += 0.04;
    },
  },
  {
    id: 'miss_guard',
    name: '安定装甲 (ミス耐性+)',
    description: 'ミス時のペナルティを軽減。',
    apply: (player) => {
      player.perks.missMitigation += 0.2;
    },
  },
  {
    id: 'long_mastery',
    name: '長文極意 (長文倍率+)',
    description: '長文成功時のダメージアップ。',
    apply: (player) => {
      player.perks.longBonus += 0.2;
    },
  },
  {
    id: 'skill_slot',
    name: 'スキル解放 (+1 Skill)',
    description: '未開放スキルを1つ獲得。',
    apply: (player, run) => {
      const locked = run.unlockPool.filter((id) => !player.skills.includes(id));
      if (locked.length > 0) player.skills.push(locked[0]);
    },
  },
];

module.exports = { REWARDS };
