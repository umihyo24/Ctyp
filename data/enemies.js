const ENEMIES = [
  {
    id: 'wasp',
    name: 'Needle Wasp',
    hp: 62,
    atk: 9,
    defense: 3,
    traits: { fast: true, antiShort: 0.2, antiLong: -0.1, missPunish: 1 },
  },
  {
    id: 'jelly',
    name: 'Mirror Jelly',
    hp: 78,
    atk: 7,
    defense: 5,
    traits: { fast: false, antiShort: -0.1, antiLong: 0.25, missPunish: 2 },
  },
  {
    id: 'chimera',
    name: 'Boss: Echo Chimera',
    hp: 120,
    atk: 12,
    defense: 7,
    traits: { fast: true, antiShort: 0.1, antiLong: 0.1, missPunish: 2, boss: true },
  },
];

function pickEnemy(stage, rng = Math.random) {
  if (stage >= 4) return JSON.parse(JSON.stringify(ENEMIES[2]));
  const pool = ENEMIES.slice(0, 2);
  return JSON.parse(JSON.stringify(pool[Math.floor(rng() * pool.length)]));
}

module.exports = { ENEMIES, pickEnemy };
