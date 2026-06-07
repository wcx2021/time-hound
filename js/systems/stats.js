/** 猎犬部件模板 */
Game.PART_POOL = [
  { type: 'claw', name: '裂时之爪', stat: 'timeFlow', desc: '时间流速' },
  { type: 'eye', name: '深渊之眼', stat: 'stealMultiplier', desc: '窃取倍率' },
  { type: 'collar', name: '猎犬项圈', stat: 'luck', desc: '幸运值' },
  { type: 'fang', name: '虚空獠牙', stat: 'timeFlow', desc: '时间流速' },
  { type: 'mane', name: '光阴鬃毛', stat: 'stealMultiplier', desc: '窃取倍率' },
  { type: 'tail', name: '熵能尾鳍', stat: 'luck', desc: '幸运值' },
  { type: 'paw', name: '幽影足印', stat: 'timeFlow', desc: '时间流速' },
  { type: 'whisker', name: '相位触须', stat: 'luck', desc: '幸运值' },
];

Game.BASE_STATS = {
  timeFlow: 1,
  stealMultiplier: 1,
  luck: 0,
  timeCurse: 0,
};

Game.getStats = function () {
  const stats = {
    timeFlow: Game.BASE_STATS.timeFlow,
    stealMultiplier: Game.BASE_STATS.stealMultiplier,
    luck: Game.BASE_STATS.luck,
    timeCurse: Game.BASE_STATS.timeCurse,
  };

  const upgrades = Game.state.upgrades;
  stats.timeFlow += upgrades.timeFlow * 0.08;
  stats.stealMultiplier += upgrades.stealMultiplier * 0.1;
  stats.luck += upgrades.luck;

  for (let i = 0; i < Game.state.parts.length; i++) {
    const part = Game.state.parts[i];
    stats[part.stat] += part.value;
  }

  const equipped = Game.getEquippedCursedParts();
  if (equipped.length > 0) {
    let curseMult = 1;
    for (let i = 0; i < equipped.length; i++) {
      curseMult *= (1 + equipped[i].timeCurseValue);
      stats.timeCurse += equipped[i].timeCurseValue;
    }
    stats.timeFlow *= curseMult;
    stats.stealMultiplier *= curseMult;
    stats.luck = Math.round(stats.luck * curseMult);
  }

  // 添加时间悖论加成
  if (Game.state.paradoxMilestones > 0) {
    const paradoxBonus = Game.getParadoxBonus();
    stats.timeFlow += paradoxBonus.timeFlowBonus;
    stats.stealMultiplier += paradoxBonus.stealMultiplierBonus;
    stats.luck += paradoxBonus.luckBonus;
  }

  return stats;
};

Game.getLuckCaptureReduction = function () {
  const luck = Game.getStats().luck;
  const ratio = luck * 0.04;
  return Math.min(Game.CONFIG.maxLuckCaptureReduction, ratio);
};
