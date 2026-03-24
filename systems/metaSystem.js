const fs = require('fs');
const path = require('path');

const META_FILE = path.join(__dirname, '..', 'meta-progress.json');

function loadMeta() {
  try {
    const raw = fs.readFileSync(META_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { legacyPoints: 0, unlockedSkills: ['burst', 'guard'], runs: 0, bestStage: 0 };
  }
}

function saveMeta(meta) {
  fs.writeFileSync(META_FILE, JSON.stringify(meta, null, 2));
}

function applyMetaBonuses(player, meta) {
  player.maxHp += meta.legacyPoints;
  player.hp = player.maxHp;
  player.maxFocus += Math.floor(meta.legacyPoints / 2);
  player.focus = player.maxFocus;
  player.skills = [...new Set([...player.skills, ...meta.unlockedSkills])];
}

function completeRun(meta, result) {
  meta.runs += 1;
  meta.bestStage = Math.max(meta.bestStage, result.clearedStage);
  const gain = result.victory ? 5 + result.clearedStage * 2 : 2 + result.clearedStage;
  meta.legacyPoints += gain;

  if (meta.legacyPoints >= 8 && !meta.unlockedSkills.includes('recover')) {
    meta.unlockedSkills.push('recover');
  }

  saveMeta(meta);
  return gain;
}

module.exports = { loadMeta, saveMeta, applyMetaBonuses, completeRun };
