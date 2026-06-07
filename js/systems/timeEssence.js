Game.getEssencePerSecond = function () {
  return Game.CONFIG.essencePerSecond + Game.state.upgrades.essenceRate * 0.5;
};

Game.getBarFillSeconds = function () {
  return Game.CONFIG.barFillSeconds + Game.state.upgrades.barFill * 2;
};

Game.getElapsedSeconds = function () {
  return (Date.now() - Game.state.lastStealTime) / 1000;
};

Game.getEffectiveElapsedSeconds = function () {
  const stats = Game.getStats();
  return Game.getElapsedSeconds() * stats.timeFlow;
};

Game.getCappedElapsedSeconds = function () {
  return Math.min(Game.getEffectiveElapsedSeconds(), Game.getBarFillSeconds());
};

Game.isBarFull = function () {
  return Game.getEffectiveElapsedSeconds() >= Game.getBarFillSeconds();
};

Game.getPendingEssence = function () {
  const stats = Game.getStats();
  return Game.getCappedElapsedSeconds() * Game.getEssencePerSecond();
};

Game.getProgressPercent = function () {
  const elapsed = Game.getCappedElapsedSeconds();
  const percent = (elapsed / Game.getBarFillSeconds()) * 100;
  return Math.min(percent, 100);
};

Game.stealTime = function () {
  const pending = Game.getPendingEssence();
  if (pending <= 0) return { gained: 0, captured: null };

  let result = { gained: 0, captured: null, cursedHoundCaught: false };
  let cursedHoundCaught = false;
  let normalHoundCaught = false;
  let capturedPart = null;

  // 独立检查两个猎犬，让它们都有可能触发
  // 第二条猎犬在完成 1E5 诅咒点后才会出现
  if (Game.isCursePointsGoalReached()) {
    const cursedHoundChance = Game.getCursedHoundRisk();
    if (Math.random() < cursedHoundChance) {
      cursedHoundCaught = true;
    }
  }

  const captureChance = Game.getStealCaptureChance();
  if (Math.random() < captureChance) {
    capturedPart = Game.triggerCapture();
    normalHoundCaught = true;
  }

  // 重置时间进度（无论是否被捕获）
  Game.state.lastStealTime = Date.now();

  // 根据捕获情况设置结果
  if (cursedHoundCaught && normalHoundCaught) {
    // 两个猎犬同时捕获 - 触发时间悖论！
    result.cursedHoundCaught = true;
    result.captured = capturedPart;
    result.bothCaught = true;
    result.paradox = true;
    // 触发时间悖论
    Game.triggerParadox();
  } else if (cursedHoundCaught) {
    // 只被诅咒猎犬捕获
    result.cursedHoundCaught = true;
  } else if (normalHoundCaught) {
    // 只被普通猎犬捕获
    result.captured = capturedPart;
  } else {
    // 都没被捕获，获得时间本质
    const stats = Game.getStats();
    const gained = pending * stats.stealMultiplier;
    Game.state.total += gained;
    Game.state.hasStolenOnce = true;
    Game.checkCurseGate();
    result.gained = gained;
  }

  return result;
};
