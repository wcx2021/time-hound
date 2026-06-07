Game.save = function () {
  try {
    var data = {
      total: Game.state.total,
      lastStealTime: Game.state.lastStealTime,
      captureCount: Game.state.captureCount,
      hasStolenOnce: Game.state.hasStolenOnce,
      parts: Game.state.parts,
      curseGatePassed: Game.state.curseGatePassed,
      curseTimes: Game.state.curseTimes,
      cursePoints: Game.state.cursePoints,
      cursedParts: Game.state.cursedParts,
      equippedCursedPartId: Game.state.equippedCursedPartId,
      upgrades: Game.state.upgrades,
      curseShopUpgrades: Game.state.curseShopUpgrades,
      challengesComplete: Game.state.challengesComplete,
      paradoxPoints: Game.state.paradoxPoints,
      paradoxMilestones: Game.state.paradoxMilestones,
      currentPage: Game.Navigation ? Game.Navigation.getCurrentPage() : 'steal',
    };
    localStorage.setItem(Game.SAVE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
};

Game.load = function () {
  try {
    var raw = localStorage.getItem(Game.SAVE_KEY);
    if (!raw) return false;

    var data = JSON.parse(raw);
    Game.state.total = data.total || 0;
    Game.state.lastStealTime = data.lastStealTime || Date.now();
    Game.state.captureCount = data.captureCount || 0;
    Game.state.hasStolenOnce = !!data.hasStolenOnce;
    Game.state.parts = data.parts || [];
    Game.state.curseGatePassed = !!data.curseGatePassed;
    Game.state.curseTimes = data.curseTimes || 0;
    if (data.cursePoints !== undefined) {
      Game.state.cursePoints = data.cursePoints;
    } else {
      Game.state.cursePoints = Game.state.curseTimes * Game.CONFIG.baseCursePointsPerSacrifice;
    }
    Game.state.cursedParts = data.cursedParts || [];
    Game.state.equippedCursedPartId = data.equippedCursedPartId || null;
    Game.state.upgrades = Object.assign({}, Game.state.upgrades, data.upgrades || {});
    Game.state.curseShopUpgrades = Object.assign(
      {},
      Game.state.curseShopUpgrades,
      data.curseShopUpgrades || {}
    );
    Game.state.challengesComplete = data.challengesComplete || 0;
    Game.state.paradoxPoints = data.paradoxPoints || 0;
    Game.state.paradoxMilestones = data.paradoxMilestones || 0;

    if (!Game.state.curseGatePassed && Game.state.total >= Game.CONFIG.curseThreshold) {
      Game.state.curseGatePassed = true;
    }

    // 恢复上次浏览的子页面
    if (data.currentPage && Game.Navigation) {
      Game.Navigation.switchTo(data.currentPage, true);
    }

    return true;
  } catch (err) {
    return false;
  }
};

Game.resetSave = function () {
  if (!confirm('确定要重置所有存档吗？此操作不可撤销！')) {
    return false;
  }
  localStorage.removeItem(Game.SAVE_KEY);
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
    challengesComplete: 0,
    cursedHoundBaseChance: 0.1,
    paradoxPoints: 0,
    paradoxMilestones: 0,
  };
  Game.forceRefreshLists();
  Game.updateUI();
  Game.save();
  return true;
};
