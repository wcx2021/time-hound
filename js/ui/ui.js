Game.els = {
  total: document.getElementById('essence-total'),
  pending: document.getElementById('essence-pending'),
  pendingCap: document.getElementById('pending-cap'),
  progressBar: document.getElementById('progress-bar'),
  stealBtn: document.getElementById('steal-btn'),
  upgradePanel: document.getElementById('upgrade-panel'),
  upgradeList: document.getElementById('upgrade-list'),
  captureCount: document.getElementById('capture-count'),
  captureRisk: document.getElementById('capture-risk'),
  riskBar: document.getElementById('risk-bar'),
  statTimeFlow: document.getElementById('stat-time-flow'),
  statStealMult: document.getElementById('stat-steal-mult'),
  statLuck: document.getElementById('stat-luck'),
  partsList: document.getElementById('parts-list'),
  captureToast: document.getElementById('capture-toast'),
  toastBody: document.getElementById('toast-body'),
  curseMilestone: document.getElementById('curse-milestone'),
  curseBar: document.getElementById('curse-bar'),
  curseProgressText: document.getElementById('curse-progress-text'),
  curseRemainingText: document.getElementById('curse-remaining-text'),
  curseBtn: document.getElementById('curse-btn'),
  curseTimesMilestone: document.getElementById('curse-times-milestone'),
  curseTimesBar: document.getElementById('curse-times-bar'),
  curseTimesText: document.getElementById('curse-times-text'),
  curseTimesRemaining: document.getElementById('curse-times-remaining'),
  curseBtnTimes: document.getElementById('curse-btn-times'),
  cursePointsMilestone: document.getElementById('curse-points-milestone'),
  cursePointsBar: document.getElementById('curse-points-bar'),
  cursePointsText: document.getElementById('curse-points-text'),
  cursePointsRemaining: document.getElementById('curse-points-remaining'),
  curseBtnPoints: document.getElementById('curse-btn-points'),
  curseStats: document.getElementById('curse-stats'),
  curseTimesDisplay: document.getElementById('curse-times-display'),
  cursePointsDisplay: document.getElementById('curse-points-display'),
  statCurseItem: document.getElementById('stat-curse-item'),
  statTimeCurse: document.getElementById('stat-time-curse'),
  cursedEquippedPanel: document.getElementById('cursed-equipped-panel'),
  cursedEquipped: document.getElementById('cursed-equipped'),
  // 新添加：挑战相关
  challengesMilestone: document.getElementById('challenges-milestone'),
  challengesBar: document.getElementById('challenges-bar'),
  challengesText: document.getElementById('challenges-text'),
  challengesRemaining: document.getElementById('challenges-remaining'),
  curseBtnChallenges: document.getElementById('curse-btn-challenges'),
  // 新添加：第二条猎犬相关
  cursedHoundPanel: document.getElementById('cursed-hound-panel'),
  cursedHoundRisk: document.getElementById('cursed-hound-risk'),
  cursedHoundBar: document.getElementById('cursed-hound-bar'),
  // 新添加：设置相关
  settingsBtn: document.getElementById('settings-btn'),
  settingsPanel: document.getElementById('settings-panel'),
  closeSettingsBtn: document.getElementById('close-settings-btn'),
  resetSaveBtn: document.getElementById('reset-save-btn'),
  // 新添加：时间悖论相关
  paradoxMilestone: document.getElementById('paradox-milestone'),
  paradoxBar: document.getElementById('paradox-bar'),
  paradoxText: document.getElementById('paradox-text'),
  paradoxRemaining: document.getElementById('paradox-remaining'),
};

Game.toastTimer = null;
Game.lastUpgradeSnapshot = '';
Game.lastPartsSnapshot = '';

Game.formatNumber = function (value) {
  if (value < 1000) {
    return value.toFixed(1).replace(/\.0$/, '');
  }
  return Math.floor(value).toLocaleString('zh-CN');
};

Game.getUpgradeSnapshot = function () {
  return Game.UPGRADES.map(function (upgrade) {
    return (
      upgrade.id + ':' +
      Game.getUpgradeLevel(upgrade.id) + ':' +
      Game.getUpgradeCost(upgrade.id) + ':' +
      (Game.canAffordUpgrade(upgrade.id) ? '1' : '0')
    );
  }).join('|');
};

Game.getPartsSnapshot = function () {
  const normal = Game.state.parts
    .map(function (part) {
      return part.type + ':' + part.concentration;
    })
    .sort()
    .join('|');
  const equipped = Game.state.equippedCursedPartId || 'none';
  return normal + '||' + equipped;
};

Game.renderPartsList = function () {
  if (Game.state.parts.length === 0) {
    Game.els.partsList.innerHTML = '<div class="parts-empty">尚未获得部件</div>';
    return;
  }

  let html = '';
  const sorted = Game.state.parts.slice().sort(function (a, b) {
    return b.concentration - a.concentration;
  });

  for (let i = 0; i < sorted.length; i++) {
    const part = sorted[i];
    const bonus = Game.formatStatValue(part.stat, part.value);
    const label = Game.getStatLabel(part.stat);
    const tier = Game.getConcentrationTier(part.concentration);
    html +=
      '<div class="part-item stat-' + part.stat + '">' +
      '<div class="part-main">' +
      '<span class="part-name">' + part.name + '</span>' +
      '<span class="part-concentration conc-' + tier + '">浓度 ' + part.concentration + '</span>' +
      '</div>' +
      '<span class="part-bonus">' + label + ' ' + bonus + '</span>' +
      '</div>';
  }
  Game.els.partsList.innerHTML = html;
};

Game.renderCursedEquipped = function () {
  const equipped = Game.getEquippedCursedParts();
  if (equipped.length === 0) {
    Game.els.cursedEquippedPanel.classList.add('hidden');
    return;
  }

  Game.els.cursedEquippedPanel.classList.remove('hidden');
  let html = '';
  for (let i = 0; i < equipped.length; i++) {
    const part = equipped[i];
    const tier = Game.getConcentrationTier(part.concentration);
    const curseLabel = Game.formatStatValue('timeCurse', part.timeCurseValue);
    html +=
      '<div class="part-item stat-timeCurse">' +
      '<div class="part-main">' +
      '<span class="part-name">' + part.name + '</span>' +
      '<span class="part-concentration conc-' + tier + '">浓度 ' + part.concentration + '</span>' +
      '</div>' +
      '<span class="part-bonus">时间诅咒 ' + curseLabel + '</span>' +
      '</div>';
  }
  Game.els.cursedEquipped.innerHTML = html;
  Game.els.cursedEquippedPanel.classList.remove('hidden');
};

Game.renderPartsListIfNeeded = function () {
  const snapshot = Game.getPartsSnapshot();
  if (snapshot === Game.lastPartsSnapshot) return;
  Game.lastPartsSnapshot = snapshot;
  Game.renderPartsList();
  Game.renderCursedEquipped();
};

Game.renderUpgradeList = function () {
  let html = '';
  for (let i = 0; i < Game.UPGRADES.length; i++) {
    const upgrade = Game.UPGRADES[i];
    const level = Game.getUpgradeLevel(upgrade.id);
    const cost = Game.getUpgradeCost(upgrade.id);
    const canBuy = Game.canAffordUpgrade(upgrade.id);

    html +=
      '<div class="upgrade-item">' +
      '<div class="upgrade-info">' +
      '<div class="upgrade-name">' + upgrade.name + '</div>' +
      '<div class="upgrade-desc">' + upgrade.desc + ' ' + upgrade.effectText + '</div>' +
      '<div class="upgrade-level">等级 ' + level + '</div>' +
      '</div>' +
      '<button type="button" class="upgrade-btn" data-upgrade="' + upgrade.id + '"' +
      (canBuy ? '' : ' disabled') + '>' +
      Game.formatNumber(cost) + ' 本质' +
      '</button>' +
      '</div>';
  }
  Game.els.upgradeList.innerHTML = html;
};

Game.renderUpgradeListIfNeeded = function () {
  const snapshot = Game.getUpgradeSnapshot();
  if (snapshot === Game.lastUpgradeSnapshot) return;
  Game.lastUpgradeSnapshot = snapshot;
  Game.renderUpgradeList();
};

Game.forceRefreshLists = function () {
  Game.lastUpgradeSnapshot = '';
  Game.lastPartsSnapshot = '';
  Game.renderUpgradeListIfNeeded();
  Game.renderPartsListIfNeeded();
};

Game.showCaptureToast = function (result) {
  // 新添加：处理时间悖论的情况
  if (result.paradox) {
    Game.els.toastBody.textContent = '时间悖论触发！所有加成归零，但获得了永久性的全属性加成...';
    Game.els.captureToast.classList.remove('hidden');

    if (Game.toastTimer) {
      clearTimeout(Game.toastTimer);
    }
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 3500);
    return;
  }

  // 新添加：处理两个猎犬同时捕获的情况
  if (result.bothCaught) {
    const part = result.captured;
    const label = Game.getStatLabel(part.stat);
    const bonus = Game.formatStatValue(part.stat, part.value);
    let partText = '';
    if (result.captured.merged) {
      if (result.captured.gainedConcentration <= 0) {
        partText = part.name + ' 吞噬合成，浓度已达上限 ' + Game.MAX_CONCENTRATION;
      } else {
        partText = part.name + ' 吞噬合成！浓度 +' + result.captured.gainedConcentration +
          ' → ' + part.concentration + '（' + label + ' ' + bonus + '）';
      }
    } else {
      partText = '获得：' + part.name + '（浓度 ' + part.concentration + '，' + label + ' ' + bonus + '）';
    }
    Game.els.toastBody.textContent = '两只猎犬同时出现了！' + partText;
    Game.els.captureToast.classList.remove('hidden');

    if (Game.toastTimer) {
      clearTimeout(Game.toastTimer);
    }
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 2800);
    return;
  }

  // 新添加：处理被第二条猎犬捕获的情况
  if (result.cursedHoundCaught) {
    Game.els.toastBody.textContent = '被诅咒的猎犬发现了你！什么都没有获得...';
    Game.els.captureToast.classList.remove('hidden');

    if (Game.toastTimer) {
      clearTimeout(Game.toastTimer);
    }
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 2800);
    return;
  }

  const part = result.part;
  const label = Game.getStatLabel(part.stat);
  const bonus = Game.formatStatValue(part.stat, part.value);

  if (result.merged) {
    if (result.gainedConcentration <= 0) {
      Game.els.toastBody.textContent =
        part.name + ' 吞噬合成，浓度已达上限 ' + Game.MAX_CONCENTRATION;
    } else {
      Game.els.toastBody.textContent =
        part.name + ' 吞噬合成！浓度 +' + result.gainedConcentration +
        ' → ' + part.concentration + '（' + label + ' ' + bonus + '）';
    }
  } else {
    Game.els.toastBody.textContent =
      '获得：' + part.name + '（浓度 ' + part.concentration + '，' + label + ' ' + bonus + '）';
  }

  Game.els.captureToast.classList.remove('hidden');

  if (Game.toastTimer) {
    clearTimeout(Game.toastTimer);
  }
  Game.toastTimer = setTimeout(function () {
    Game.els.captureToast.classList.add('hidden');
  }, 2800);
};

Game.updateUI = function () {
  const pending = Game.getPendingEssence();
  const stats = Game.getStats();
  const risk = Game.getCaptureRiskPercent();
  const barFull = Game.isBarFull();
  const upgradesUnlocked = Game.state.hasStolenOnce;

  Game.els.total.textContent = Game.formatNumber(Game.state.total);
  Game.els.pending.textContent = Game.formatNumber(pending);
  Game.els.progressBar.style.width = Game.getProgressPercent() + '%';
  Game.els.progressBar.classList.toggle('full', barFull);
  Game.els.pendingCap.classList.toggle('hidden', !barFull);
  Game.els.stealBtn.disabled = pending <= 0;

  Game.els.upgradePanel.classList.toggle('hidden', !upgradesUnlocked);
  if (upgradesUnlocked) {
    Game.renderUpgradeListIfNeeded();
  }

  Game.els.captureCount.textContent = Game.state.captureCount;
  Game.els.captureRisk.textContent = risk.toFixed(1) + '%';
  Game.els.riskBar.style.width = risk + '%';

  Game.els.statTimeFlow.textContent = '×' + stats.timeFlow.toFixed(2);
  Game.els.statStealMult.textContent = '×' + stats.stealMultiplier.toFixed(2);
  Game.els.statLuck.textContent = stats.luck;

  if (stats.timeCurse > 0) {
    Game.els.statCurseItem.classList.remove('hidden');
    Game.els.statTimeCurse.textContent = '×' + (1 + stats.timeCurse).toFixed(2);
  } else {
    Game.els.statCurseItem.classList.add('hidden');
  }

  Game.renderPartsListIfNeeded();

  Game.checkCurseGate();
  const gatePassed = Game.isCurseGatePassed();
  const timesComplete = Game.isCurseTimesComplete();
  const pointsComplete = Game.isCursePointsGoalReached();
  const paradoxUnlocked = Game.state.paradoxMilestones > 0;

  Game.els.curseMilestone.classList.toggle('hidden', gatePassed);
  Game.els.curseTimesMilestone.classList.toggle('hidden', !gatePassed || timesComplete);
  Game.els.cursePointsMilestone.classList.toggle('hidden', !timesComplete || pointsComplete);
  Game.els.challengesMilestone.classList.toggle('hidden', !pointsComplete);
  Game.els.paradoxMilestone.classList.toggle('hidden', !paradoxUnlocked);
  Game.els.curseStats.classList.toggle('hidden', !timesComplete);

  // 新添加：第二条猎犬显示（在完成 1E5 诅咒点后才出现）
  if (pointsComplete) {
    Game.els.cursedHoundPanel.classList.remove('hidden');
    const cursedHoundRisk = Game.getCursedHoundRiskPercent();
    Game.els.cursedHoundRisk.textContent = cursedHoundRisk.toFixed(1) + '%';
    Game.els.cursedHoundBar.style.width = cursedHoundRisk + '%';
  } else {
    Game.els.cursedHoundPanel.classList.add('hidden');
  }

  if (!gatePassed) {
    const remaining = Game.getCurseRemaining();
    const progress = Game.getCurseProgressPercent();
    Game.els.curseBar.style.width = progress + '%';
    Game.els.curseProgressText.textContent =
      Game.formatNumber(Game.state.total) + ' / ' + Game.formatCurseThreshold() + ' 时间本质';
    Game.els.curseRemainingText.textContent = '还差 ' + Game.formatNumber(remaining);
    Game.els.curseBtn.classList.toggle('hidden', !gatePassed);
  } else if (!timesComplete) {
    const timesRemaining = Game.getCurseTimesRemaining();
    const timesProgress = Game.getCurseTimesProgressPercent();
    Game.els.curseTimesBar.style.width = timesProgress + '%';
    Game.els.curseTimesText.textContent =
      Game.state.curseTimes + ' / ' + Game.CONFIG.curseTimesGoal;
    Game.els.curseTimesRemaining.textContent = '还差 ' + timesRemaining + ' 次';
  } else if (!pointsComplete) {
    Game.els.curseTimesDisplay.textContent = Game.state.curseTimes;
    Game.els.cursePointsDisplay.textContent = Game.formatNumber(Game.state.cursePoints);

    const pointsRemaining = Game.getCursePointsRemaining();
    const pointsProgress = Game.getCursePointsProgressPercent();
    Game.els.cursePointsBar.style.width = pointsProgress + '%';
    Game.els.cursePointsText.textContent =
      Game.formatNumber(Game.state.cursePoints) + ' / ' + Game.formatCursePointsGoal();

    if (Game.isCursePointsGoalReached()) {
      Game.els.cursePointsRemaining.textContent = '已达成';
    } else {
      Game.els.cursePointsRemaining.textContent =
        '还差 ' + Game.formatNumber(pointsRemaining);
    }
  } else {
    // 新添加：挑战进度显示
    const challengesRemaining = Game.getChallengesRemaining();
    const challengesProgress = Game.getChallengesProgressPercent();
    Game.els.challengesBar.style.width = challengesProgress + '%';
    Game.els.challengesText.textContent =
      Game.state.challengesComplete + ' / ' + Game.CONFIG.challengesGoal;

    if (Game.isChallengesComplete()) {
      Game.els.challengesRemaining.textContent = '已达成';
    } else {
      Game.els.challengesRemaining.textContent = '还差 ' + challengesRemaining + ' 个';
    }

    // 新添加：悖论进度显示
    if (paradoxUnlocked) {
      const paradoxBonus = Game.getParadoxBonus();
      const bonusPercent = (paradoxBonus.timeFlowBonus * 100).toFixed(0);
      Game.els.paradoxRemaining.textContent = '解锁 ' + Game.state.paradoxMilestones;
      Game.els.paradoxBar.style.width = '100%'; // 悖论里程碑是线性的，直接填满
      Game.els.paradoxText.textContent =
        '悖论点: ' + Game.state.paradoxPoints + ' | 加成: 全属性+' + bonusPercent + '%';
    }
  }
};

Game.bindStealButton = function () {
  Game.els.stealBtn.addEventListener('click', function () {
    const result = Game.stealTime();
    if (result.paradox) {
      // 时间悖论触发
      Game.forceRefreshLists();
      Game.showCaptureToast(result);
    } else if (result.bothCaught) {
      // 两个猎犬同时捕获
      Game.forceRefreshLists();
      Game.showCaptureToast(result);
    } else if (result.cursedHoundCaught) {
      // 只被诅咒猎犬捕获
      Game.showCaptureToast(result);
    } else if (result.captured) {
      // 只被普通猎犬捕获
      Game.forceRefreshLists();
      Game.showCaptureToast(result.captured);
    }
    Game.save();
    Game.updateUI();
  });
};

Game.bindUpgradeButtons = function () {
  Game.els.upgradeList.addEventListener('pointerup', function (event) {
    if (event.button !== 0) return;

    const btn = event.target.closest('[data-upgrade]');
    if (!btn || btn.disabled) return;

    const id = btn.getAttribute('data-upgrade');
    if (Game.buyUpgrade(id)) {
      Game.save();
      Game.forceRefreshLists();
      Game.updateUI();
    }
  });
};

Game.bindCurseButton = function () {
  function saveBeforeLeave() {
    Game.save();
  }
  Game.els.curseBtn.addEventListener('click', saveBeforeLeave);
  Game.els.curseBtnTimes.addEventListener('click', saveBeforeLeave);
  Game.els.curseBtnPoints.addEventListener('click', saveBeforeLeave);
  Game.els.curseBtnChallenges.addEventListener('click', saveBeforeLeave);
};

Game.bindSettingsButtons = function () {
  // 打开设置面板
  Game.els.settingsBtn.addEventListener('click', function () {
    Game.els.settingsPanel.classList.remove('hidden');
  });

  // 关闭设置面板
  Game.els.closeSettingsBtn.addEventListener('click', function () {
    Game.els.settingsPanel.classList.add('hidden');
  });

  // 点击设置面板外部关闭
  Game.els.settingsPanel.addEventListener('click', function (e) {
    if (e.target === Game.els.settingsPanel) {
      Game.els.settingsPanel.classList.add('hidden');
    }
  });

  // 重置存档按钮
  Game.els.resetSaveBtn.addEventListener('click', function () {
    if (Game.resetSave()) {
      Game.els.settingsPanel.classList.add('hidden');
    }
  });
};
