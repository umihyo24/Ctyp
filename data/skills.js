const SKILLS = {
  burst: {
    id: 'burst',
    name: 'Burst Key',
    keyword: 'burst',
    focusCost: 20,
    staminaCost: 10,
    description: '即時で大ダメージ。コンボ倍率を強く受ける。',
    apply: ({ player }) => ({
      fixedDamage: Math.round((16 + player.stats.atk * 0.9) * (1 + player.combo * 0.12)),
      selfHeal: 0,
      addCombo: 1,
    }),
  },
  guard: {
    id: 'guard',
    name: 'Guard Key',
    keyword: 'guard',
    focusCost: 12,
    staminaCost: 4,
    description: '次の敵攻撃を軽減し、ミス耐性を得る。',
    apply: () => ({ fixedDamage: 0, selfHeal: 0, addShield: 0.45, cleanseExposed: true }),
  },
  recover: {
    id: 'recover',
    name: 'Recover Key',
    keyword: 'recover',
    focusCost: 18,
    staminaCost: 6,
    description: 'HPと集中力を回復して立て直す。',
    apply: ({ player }) => ({ fixedDamage: 0, selfHeal: Math.round(10 + player.level * 2), restoreFocus: 20 }),
  },
};

module.exports = { SKILLS };
