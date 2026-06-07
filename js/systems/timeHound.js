Game.MAX_CONCENTRATION = 99;

Game.rollConcentration = function () {
  const luck = Game.getStats().luck;
  const captures = Game.state.captureCount + 1;
  const base = 4 + Math.random() * 14;
  const luckBonus = luck * 0.3;
  const captureBonus = captures * 0.45;
  return Math.min(Game.MAX_CONCENTRATION, Math.max(1, Math.round(base + luckBonus + captureBonus)));
};

Game.concentrationToValue = function (stat, concentration) {
  if (stat === 'luck') {
    return Math.max(1, Math.round(concentration * 0.2));
  }
  if (stat === 'timeFlow' || stat === 'stealMultiplier') {
    return Math.round(concentration * 0.01 * 100) / 100;
  }
  return Math.round(concentration * 0.01 * 100) / 100;
};

Game.generatePart = function () {
  const template = Game.PART_POOL[Math.floor(Math.random() * Game.PART_POOL.length)];
  const concentration = Game.rollConcentration();
  return Game.addOrMergePart(template, concentration);
};

Game.addOrMergePart = function (template, concentration) {
  let found = null;
  for (let i = 0; i < Game.state.parts.length; i++) {
    if (Game.state.parts[i].type === template.type) {
      found = Game.state.parts[i];
      break;
    }
  }

  if (found) {
    const oldConcentration = found.concentration;
    found.concentration = Math.min(Game.MAX_CONCENTRATION, found.concentration + concentration);
    found.value = Game.concentrationToValue(found.stat, found.concentration);
    return {
      merged: true,
      part: found,
      absorbedConcentration: concentration,
      gainedConcentration: found.concentration - oldConcentration,
    };
  }

  const part = {
    type: template.type,
    name: template.name,
    stat: template.stat,
    statLabel: template.desc,
    concentration: concentration,
    value: Game.concentrationToValue(template.stat, concentration),
  };
  Game.state.parts.push(part);
  return {
    merged: false,
    part: part,
    absorbedConcentration: concentration,
    gainedConcentration: concentration,
  };
};

Game.getStealCaptureChance = function () {
  const elapsed = Game.getElapsedSeconds();
  // 前3秒捕获概率为0，之后才开始增长
  if (elapsed < 3) {
    return 0;
  }
  const actualElapsed = elapsed - 3;
  const growth = 1 + actualElapsed * Game.CONFIG.captureGrowthPerSecond;
  const reduction = 1 - Game.getLuckCaptureReduction();
  const chance = Game.CONFIG.baseStealCapture * growth * reduction * (0.5 + actualElapsed * 0.1);
  return Math.min(0.92, chance);
};

Game.getCaptureRiskPercent = function () {
  return Game.getStealCaptureChance() * 100;
};

Game.triggerCapture = function () {
  const result = Game.generatePart();
  Game.state.captureCount += 1;
  Game.state.lastStealTime = Date.now();
  return result;
};

Game.formatStatValue = function (stat, value) {
  if (stat === 'luck') {
    return '+' + value;
  }
  if (stat === 'timeFlow' || stat === 'stealMultiplier') {
    return '+' + (value * 100).toFixed(0) + '%';
  }
  if (stat === 'timeCurse') {
    return '全属性 ×' + (1 + value).toFixed(2);
  }
  return '+' + value;
};

Game.getStatLabel = function (stat) {
  if (stat === 'timeFlow') return '时间流速';
  if (stat === 'stealMultiplier') return '窃取倍率';
  if (stat === 'luck') return '幸运值';
  if (stat === 'timeCurse') return '时间诅咒';
  return stat;
};

Game.getConcentrationTier = function (concentration) {
  if (concentration >= 80) return 'high';
  if (concentration >= 40) return 'mid';
  return 'low';
};
