Game.getCurseRemaining = function () {
  return Math.max(0, Game.CONFIG.curseThreshold - Game.state.total);
};

Game.getCurseProgress = function () {
  return Math.min(1, Game.state.total / Game.CONFIG.curseThreshold);
};

Game.getCurseProgressPercent = function () {
  return Game.getCurseProgress() * 100;
};

Game.checkCurseGate = function () {
  if (!Game.state.curseGatePassed && Game.state.total >= Game.CONFIG.curseThreshold) {
    Game.state.curseGatePassed = true;
  }
  return Game.state.curseGatePassed;
};

Game.isCurseGatePassed = function () {
  return Game.state.curseGatePassed;
};

Game.isCurseUnlocked = function () {
  return Game.isCurseGatePassed();
};

Game.getCurseTimesRemaining = function () {
  return Math.max(0, Game.CONFIG.curseTimesGoal - Game.state.curseTimes);
};

Game.getCurseTimesProgress = function () {
  return Math.min(1, Game.state.curseTimes / Game.CONFIG.curseTimesGoal);
};

Game.getCurseTimesProgressPercent = function () {
  return Game.getCurseTimesProgress() * 100;
};

Game.isCurseTimesComplete = function () {
  return Game.state.curseTimes >= Game.CONFIG.curseTimesGoal;
};

Game.formatCurseThreshold = function () {
  return '1E4';
};

Game.formatCursePointsGoal = function () {
  return '1E5';
};

Game.isCursePointsGoalReached = function () {
  return Game.state.cursePoints >= Game.CONFIG.cursePointsGoal;
};

// 新添加：挑战相关函数
Game.getChallengesRemaining = function () {
  return Math.max(0, Game.CONFIG.challengesGoal - Game.state.challengesComplete);
};

Game.getChallengesProgress = function () {
  return Math.min(1, Game.state.challengesComplete / Game.CONFIG.challengesGoal);
};

Game.getChallengesProgressPercent = function () {
  return Game.getChallengesProgress() * 100;
};

Game.isChallengesUnlocked = function () {
  return Game.state.cursePoints >= Game.CONFIG.cursePointsGoal;
};

Game.isChallengesComplete = function () {
  return Game.state.challengesComplete >= Game.CONFIG.challengesGoal;
};

// 新添加：第二条猎犬相关函数
Game.getCursedHoundRisk = function () {
  // 基础概率是 10%
  let baseChance = 0.1;
  
  // 被普通猎犬捕获概率越低，它出现的越高（反转关系）
  const normalRisk = Game.getCaptureRiskPercent() / 100;
  // 反转：普通风险为 0% 时，加成 100%；普通风险为 100% 时，加成 0%
  const bonusMultiplier = 1 - normalRisk;
  let maxChance = baseChance * (1 + bonusMultiplier);
  
  // 随时间本质进度条流动线性降低
  // 进度条0%时：10%概率，进度条50%时：5%，进度条100%时：0%
  const progress = Game.getProgressPercent() / 100; // 0 到 1
  let chance = maxChance * (1 - progress);
  
  // 最高不超过基础概率 * 2
  return Math.min(0.2, Math.max(0, chance));
};

// 新添加：时间悖论相关函数
Game.triggerParadox = function () {
  // 获得1悖论点
  Game.state.paradoxPoints += 1;
  
  // 里程碑加1
  Game.state.paradoxMilestones += 1;
  
  // 把所有加成都归0
  Game.state.upgrades = {
    essenceRate: 0,
    timeFlow: 0,
    stealMultiplier: 0,
    luck: 0,
    barFill: 0,
  };
  
  // 清空所有部件
  Game.state.parts = [];
  
  // 清空被诅咒部件
  Game.state.cursedParts = [];
  Game.state.equippedCursedPartId = null;
  
  // 清空诅咒商店升级
  Game.state.curseShopUpgrades = {
    pointBonus: 0,
  };
  
  // 返回true表示悖论触发成功
  return true;
};

Game.getParadoxBonus = function () {
  // 每个悖论点里程碑提供全属性加成
  // 时间流速、窃取倍率、幸运值各 +10% per milestone
  return {
    timeFlowBonus: Game.state.paradoxMilestones * 0.1,
    stealMultiplierBonus: Game.state.paradoxMilestones * 0.1,
    luckBonus: Game.state.paradoxMilestones * 1,
  };
};

Game.isParadoxUnlocked = function () {
  return Game.state.paradoxMilestones > 0;
};

Game.getCursedHoundRiskPercent = function () {
  return Game.getCursedHoundRisk() * 100;
};

Game.CURSED_PART_NAMES = [
  '蚀时之核',
  '裂隙猎心',
  '永锢咒印',
  '虚空犬魄',
  '时渊诅咒',
];

Game.concentrationToTimeCurse = function (concentration) {
  return Math.round(concentration * 0.01 * 100) / 100;
};

Game.createCursedPart = function (concentration) {
  const nameIndex = Math.floor(Math.random() * Game.CURSED_PART_NAMES.length);
  return {
    uid: 'cursed-' + Date.now() + '-' + Math.floor(Math.random() * 10000),
    type: 'cursed_core',
    name: Game.CURSED_PART_NAMES[nameIndex],
    stat: 'timeCurse',
    concentration: concentration,
    timeCurseValue: Game.concentrationToTimeCurse(concentration),
    isCursed: true,
  };
};

Game.calcSacrificeConcentration = function (essence, parts) {
  let partsConcentration = 0;
  for (let i = 0; i < parts.length; i++) {
    partsConcentration += parts[i].concentration;
  }

  const stats = Game.getStats();
  const base = 8 + Math.random() * 12;
  const essenceBonus = Math.min(35, Math.sqrt(essence) * 0.35);
  const partsBonus = Math.min(25, partsConcentration * 0.25);
  const luckBonus = stats.luck * 0.15;
  const curseBonus = Game.state.curseTimes * 1.5;

  return Math.min(
    Game.MAX_CONCENTRATION,
    Math.max(1, Math.round(base + essenceBonus + partsBonus + luckBonus + curseBonus))
  );
};

Game.canSacrifice = function () {
  return Game.isCurseGatePassed() && (Game.state.total > 0 || Game.state.parts.length > 0);
};

Game.performSacrifice = function () {
  if (!Game.canSacrifice()) return null;

  const essenceSacrificed = Game.state.total;
  const partsSacrificed = Game.state.parts.slice();
  const concentration = Game.calcSacrificeConcentration(essenceSacrificed, partsSacrificed);

  Game.state.total = 0;
  Game.state.parts = [];

  const part = Game.createCursedPart(concentration);
  Game.state.cursedParts.push(part);
  Game.state.curseTimes += 1;

  const pointsGained = Game.calcCursePointsGained(essenceSacrificed, partsSacrificed);
  Game.state.cursePoints += pointsGained;

  if (!Game.state.equippedCursedPartId) {
    Game.state.equippedCursedPartId = part.uid;
  }

  return {
    part: part,
    essenceSacrificed: essenceSacrificed,
    partsSacrificed: partsSacrificed.length,
    pointsGained: pointsGained,
  };
};

Game.getEquippedCursedParts = function () {
  const equipped = [];
  if (!Game.state.equippedCursedPartId) return equipped;
  
  const ids = Game.state.equippedCursedPartId.split(',');
  for (let i = 0; i < Game.state.cursedParts.length; i++) {
    if (ids.indexOf(Game.state.cursedParts[i].uid) !== -1) {
      equipped.push(Game.state.cursedParts[i]);
    }
  }
  return equipped;
};

Game.equipCursedPart = function (uid) {
  const part = Game.state.cursedParts.find(function(p) { return p.uid === uid; });
  if (!part) return false;
  
  const currentEquipped = Game.getEquippedCursedParts();
  const ids = Game.state.equippedCursedPartId ? Game.state.equippedCursedPartId.split(',') : [];
  
  if (ids.indexOf(uid) !== -1) {
    ids.splice(ids.indexOf(uid), 1);
    Game.state.equippedCursedPartId = ids.length > 0 ? ids.join(',') : null;
    return true;
  }
  
  if (currentEquipped.length >= Game.getMaxEquippedCursedParts()) {
    return false;
  }
  
  ids.push(uid);
  Game.state.equippedCursedPartId = ids.join(',');
  return true;
};

Game.getTimeCurseMultiplier = function () {
  const equipped = Game.getEquippedCursedParts();
  if (equipped.length === 0) return 1;
  
  let multiplier = 1;
  for (let i = 0; i < equipped.length; i++) {
    multiplier *= (1 + equipped[i].timeCurseValue);
  }
  return multiplier;
};
