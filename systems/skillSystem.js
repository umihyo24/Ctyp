const { SKILLS } = require('../data/skills');

function listPlayerSkills(player) {
  return player.skills.map((id) => SKILLS[id]).filter(Boolean);
}

function tryActivateSkill({ player, typed }) {
  const skill = listPlayerSkills(player).find((s) => s.keyword === typed.trim().toLowerCase());
  if (!skill) return { activated: false };

  if (player.focus < skill.focusCost || player.stamina < skill.staminaCost) {
    return { activated: false, reason: 'resource' };
  }

  player.focus -= skill.focusCost;
  player.stamina -= skill.staminaCost;
  const effect = skill.apply({ player });
  return { activated: true, skill, effect };
}

module.exports = { listPlayerSkills, tryActivateSkill };
