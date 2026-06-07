Game.UPGRADES = [
  {
    id: 'essenceRate',
    name: '本质汲取',
    desc: '每秒积累',
    effectText: '+0.5/级',
    effectPerLevel: 0.5,
    baseCost: 10,
    costMult: 1.5,
  },
  {
    id: 'timeFlow',
    name: '时间感知',
    desc: '时间流速',
    effectText: '+8%/级',
    effectPerLevel: 0.08,
    baseCost: 15,
    costMult: 1.55,
  },
  {
    id: 'stealMultiplier',
    name: '窃取技巧',
    desc: '窃取倍率',
    effectText: '+10%/级',
    effectPerLevel: 0.1,
    baseCost: 20,
    costMult: 1.6,
  },
  {
    id: 'luck',
    name: '命运直觉',
    desc: '幸运值',
    effectText: '+1/级',
    effectPerLevel: 1,
    baseCost: 25,
    costMult: 1.5,
  },
  {
    id: 'barFill',
    name: '时间容器',
    desc: '进度条容量',
    effectText: '+2秒/级',
    effectPerLevel: 2,
    baseCost: 30,
    costMult: 1.65,
  },
];

Game.getUpgradeLevel = function (id) {
  return Game.state.upgrades[id] || 0;
};

Game.getUpgradeCost = function (id) {
  const def = Game.UPGRADES.find(function (u) { return u.id === id; });
  const level = Game.getUpgradeLevel(id);
  return Math.floor(def.baseCost * Math.pow(def.costMult, level));
};

Game.canAffordUpgrade = function (id) {
  return Game.state.total >= Game.getUpgradeCost(id);
};

Game.buyUpgrade = function (id) {
  const cost = Game.getUpgradeCost(id);
  if (Game.state.total < cost) return false;

  Game.state.total -= cost;
  Game.state.upgrades[id] += 1;
  return true;
};
