Game.CURSE_SHOP = [
  {
    id: 'pointBonus',
    name: '诅咒增幅',
    desc: '每次被诅咒获得的诅咒点数',
    effectText: '+100%/级',
    effectPerLevel: 1.0,
    baseCost: 10,
    costMult: 2.0,
  },
  {
    id: 'equipSlots',
    name: '诅咒链接',
    desc: '允许同时装备多个被诅咒部件',
    effectText: '+1槽/级',
    effectPerLevel: 1,
    baseCost: 50,
    costMult: 2.5,
  },
  {
    id: 'partSell',
    name: '灵魂回收',
    desc: '出售被诅咒部件获得点数',
    effectText: '出售部件',
    effectPerLevel: 0,
    baseCost: 0,
    costMult: 1,
  },
];

Game.getCurseShopLevel = function (id) {
  return Game.state.curseShopUpgrades[id] || 0;
};

Game.getCurseShopCost = function (id) {
  const def = Game.CURSE_SHOP.find(function (item) { return item.id === id; });
  const level = Game.getCurseShopLevel(id);
  return Math.floor(def.baseCost * Math.pow(def.costMult, level));
};

Game.canAffordCurseShop = function (id) {
  return Game.state.cursePoints >= Game.getCurseShopCost(id);
};

Game.buyCurseShopUpgrade = function (id) {
  const cost = Game.getCurseShopCost(id);
  if (Game.state.cursePoints < cost) return false;

  Game.state.cursePoints -= cost;
  Game.state.curseShopUpgrades[id] += 1;
  return true;
};

Game.getCursePointBonusMultiplier = function () {
  const level = Game.getCurseShopLevel('pointBonus');
  return 1 + level * 1.0;
};

Game.getMaxEquippedCursedParts = function () {
  const level = Game.getCurseShopLevel('equipSlots');
  return 1 + level;
};

Game.canEquipMoreCursedParts = function () {
  return Game.state.cursedParts.length < Game.getMaxEquippedCursedParts();
};

Game.sellCursedPart = function (uid) {
  for (let i = 0; i < Game.state.cursedParts.length; i++) {
    const part = Game.state.cursedParts[i];
    if (part.uid === uid) {
      const pointsGained = Math.ceil(part.concentration * 0.5);
      Game.state.cursePoints += pointsGained;
      Game.state.cursedParts.splice(i, 1);
      if (Game.state.equippedCursedPartId === uid) {
        Game.state.equippedCursedPartId = null;
      }
      return pointsGained;
    }
  }
  return 0;
};

Game.calcCursePointsGained = function (essence, parts) {
  // 计算普通部件的总浓度
  let partsConcentration = 0;
  for (let i = 0; i < parts.length; i++) {
    partsConcentration += parts[i].concentration;
  }
  
  // 根据时间本质和部件浓度计算基础诅咒点数
  const essencePoints = Math.floor(essence / 100); // 每100时间本质得1点
  const partsPoints = Math.floor(partsConcentration / 5); // 每5浓度得1点
  const base = essencePoints + partsPoints;
  
  // 应用诅咒增幅倍率
  return Math.max(1, Math.round(base * Game.getCursePointBonusMultiplier()));
};

Game.formatCursePointsGoal = function () {
  return '1E5';
};

Game.getCursePointsRemaining = function () {
  return Math.max(0, Game.CONFIG.cursePointsGoal - Game.state.cursePoints);
};

Game.getCursePointsProgress = function () {
  return Math.min(1, Game.state.cursePoints / Game.CONFIG.cursePointsGoal);
};

Game.getCursePointsProgressPercent = function () {
  return Game.getCursePointsProgress() * 100;
};

Game.isCursePointsGoalReached = function () {
  return Game.state.cursePoints >= Game.CONFIG.cursePointsGoal;
};
