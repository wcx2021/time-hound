window.Game = window.Game || {};

Game.SAVE_KEY = 'time-hound-save';

Game.state = {
  total: 0,
  lastStealTime: Date.now(),
  captureCount: 0,
  hasStolenOnce: false,
  parts: [],
  curseGatePassed: false,
  curseTimes: 0,
  cursePoints: 0,
  cursedParts: [],
  equippedCursedPartId: null,
  upgrades: {
    essenceRate: 0,
    timeFlow: 0,
    stealMultiplier: 0,
    luck: 0,
    barFill: 0,
  },
  curseShopUpgrades: {
    pointBonus: 0,
  },
  // 新添加：挑战相关
  challengesComplete: 0,
  // 新添加：第二条猎犬相关
  cursedHoundBaseChance: 0.1, // 10% 基础概率
  // 新添加：时间悖论相关
  paradoxPoints: 0,
  paradoxMilestones: 0,
};

Game.CONFIG = {
  essencePerSecond: 1,
  barFillSeconds: 10,
  baseStealCapture: 0.08,
  captureGrowthPerSecond: 0.08,
  maxLuckCaptureReduction: 0.7,
  curseThreshold: 1e4,
  curseTimesGoal: 10,
  cursePointsGoal: 1e5,
  baseCursePointsPerSacrifice: 1,
  // 新添加：挑战相关
  challengesGoal: 5,
};
