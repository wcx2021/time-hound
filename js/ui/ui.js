/* ===== 窃取页 DOM 引用 ===== */
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
  curseStats: document.getElementById('curse-stats'),
  curseTimesDisplay: document.getElementById('curse-times-display'),
  cursePointsDisplay: document.getElementById('curse-points-display'),
  statCurseItem: document.getElementById('stat-curse-item'),
  statTimeCurse: document.getElementById('stat-time-curse'),
  cursedEquippedPanel: document.getElementById('cursed-equipped-panel'),
  cursedEquipped: document.getElementById('cursed-equipped'),
  cursedHoundPanel: document.getElementById('cursed-hound-panel'),
  cursedHoundRisk: document.getElementById('cursed-hound-risk'),
  cursedHoundBar: document.getElementById('cursed-hound-bar'),
  resetSaveBtn: document.getElementById('reset-save-btn'),
};

/* ===== 升级页 DOM 引用 ===== */
Game.curseEls = {
  sacrificePreview: document.getElementById('sacrifice-preview'),
  sacrificeBtn: document.getElementById('sacrifice-btn'),
  cursePartsList: document.getElementById('curse-parts-list'),
  curseShopPanel: document.getElementById('curse-shop-panel'),
  cursePointsBalance: document.getElementById('curse-points-balance'),
  curseShopList: document.getElementById('curse-shop-list'),
  curseChallengesPanel: document.getElementById('curse-challenges-panel'),
  challengeBtn: document.getElementById('challenge-btn'),
};

/* ===== 进度页 DOM 引用 ===== */
Game.progressEls = {
  achievementsList: document.getElementById('achievements-list'),
  statsDetailList: document.getElementById('stats-detail-list'),
};

/* ===== 成就定义 ===== */
Game.ACHIEVEMENTS = [
  {
    id: 'curseGate',
    name: '诅咒之门',
    desc: '累计 1E4 时间本质',
    isComplete: function () { return Game.isCurseGatePassed(); },
  },
  {
    id: 'curseTimes',
    name: '诅咒之身',
    desc: '被诅咒 10 次',
    isComplete: function () { return Game.isCurseTimesComplete(); },
  },
  {
    id: 'cursePoints',
    name: '诅咒之力',
    desc: '累计 1E5 诅咒点数',
    isComplete: function () { return Game.isCursePointsGoalReached(); },
  },
  {
    id: 'challenges',
    name: '诅咒之巅',
    desc: '完成 5 个挑战',
    isComplete: function () { return Game.isChallengesComplete(); },
  },
  {
    id: 'paradox',
    name: '时间悖论',
    desc: '触发时间悖论',
    isComplete: function () { return Game.isParadoxUnlocked(); },
  },
];

/* ===== 快照缓存 ===== */
Game.toastTimer = null;
Game.curseToastTimer = null;
Game.lastUpgradeSnapshot = '';
Game.lastPartsSnapshot = '';
Game.lastCurseShopSnapshot = '';
Game.lastAchievementsSnapshot = '';

/* ===== 工具函数 ===== */
Game.formatNumber = function (value) {
  if (value < 1000) {
    return value.toFixed(1).replace(/\.0$/, '');
  }
  return Math.floor(value).toLocaleString('zh-CN');
};

/* ===== 窃取页渲染 ===== */

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
  var normal = Game.state.parts
    .map(function (part) {
      return part.type + ':' + part.concentration;
    })
    .sort()
    .join('|');
  var equipped = Game.state.equippedCursedPartId || 'none';
  return normal + '||' + equipped;
};

Game.renderPartsList = function () {
  if (Game.state.parts.length === 0) {
    Game.els.partsList.innerHTML = '<div class="parts-empty">尚未获得部件</div>';
    return;
  }

  var html = '';
  var sorted = Game.state.parts.slice().sort(function (a, b) {
    return b.concentration - a.concentration;
  });

  for (var i = 0; i < sorted.length; i++) {
    var part = sorted[i];
    var bonus = Game.formatStatValue(part.stat, part.value);
    var label = Game.getStatLabel(part.stat);
    var tier = Game.getConcentrationTier(part.concentration);
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
  var equipped = Game.getEquippedCursedParts();
  if (equipped.length === 0) {
    Game.els.cursedEquippedPanel.classList.add('hidden');
    return;
  }

  Game.els.cursedEquippedPanel.classList.remove('hidden');
  var html = '';
  for (var i = 0; i < equipped.length; i++) {
    var part = equipped[i];
    var tier = Game.getConcentrationTier(part.concentration);
    var curseLabel = Game.formatStatValue('timeCurse', part.timeCurseValue);
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
  var snapshot = Game.getPartsSnapshot();
  if (snapshot === Game.lastPartsSnapshot) return;
  Game.lastPartsSnapshot = snapshot;
  Game.renderPartsList();
  Game.renderCursedEquipped();
};

Game.renderUpgradeList = function () {
  var html = '';
  for (var i = 0; i < Game.UPGRADES.length; i++) {
    var upgrade = Game.UPGRADES[i];
    var level = Game.getUpgradeLevel(upgrade.id);
    var cost = Game.getUpgradeCost(upgrade.id);
    var canBuy = Game.canAffordUpgrade(upgrade.id);

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
  var snapshot = Game.getUpgradeSnapshot();
  if (snapshot === Game.lastUpgradeSnapshot) return;
  Game.lastUpgradeSnapshot = snapshot;
  Game.renderUpgradeList();
};

Game.forceRefreshLists = function () {
  Game.lastUpgradeSnapshot = '';
  Game.lastPartsSnapshot = '';
  Game.lastCurseShopSnapshot = '';
  Game.lastAchievementsSnapshot = '';
  Game.renderUpgradeListIfNeeded();
  Game.renderPartsListIfNeeded();
  Game.renderCurseShopIfNeeded();
  Game.renderAchievementsIfNeeded();
};

Game.showCaptureToast = function (result) {
  Game.els.captureToast.querySelector('.toast-title').textContent = '被时间猎犬捕获！';
  if (result.paradox) {
    Game.els.toastBody.textContent = '时间悖论触发！所有加成归零，但获得了永久性的全属性加成...';
    Game.els.captureToast.classList.remove('hidden');
    if (Game.toastTimer) clearTimeout(Game.toastTimer);
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 3500);
    return;
  }

  if (result.bothCaught) {
    var part = result.captured;
    var label = Game.getStatLabel(part.stat);
    var bonus = Game.formatStatValue(part.stat, part.value);
    var partText = '';
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
    if (Game.toastTimer) clearTimeout(Game.toastTimer);
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 2800);
    return;
  }

  if (result.cursedHoundCaught) {
    Game.els.toastBody.textContent = '被诅咒的猎犬发现了你！什么都没有获得...';
    Game.els.captureToast.classList.remove('hidden');
    if (Game.toastTimer) clearTimeout(Game.toastTimer);
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 2800);
    return;
  }

  var capturedPart = result.part || result.captured;
  if (capturedPart) {
    var cLabel = Game.getStatLabel(capturedPart.stat);
    var cBonus = Game.formatStatValue(capturedPart.stat, capturedPart.value);

    if (result.merged) {
      if (result.gainedConcentration <= 0) {
        Game.els.toastBody.textContent =
          capturedPart.name + ' 吞噬合成，浓度已达上限 ' + Game.MAX_CONCENTRATION;
      } else {
        Game.els.toastBody.textContent =
          capturedPart.name + ' 吞噬合成！浓度 +' + result.gainedConcentration +
          ' → ' + capturedPart.concentration + '（' + cLabel + ' ' + cBonus + '）';
      }
    } else {
      Game.els.toastBody.textContent =
        '获得：' + capturedPart.name + '（浓度 ' + capturedPart.concentration + '，' + cLabel + ' ' + cBonus + '）';
    }

    Game.els.captureToast.classList.remove('hidden');
    if (Game.toastTimer) clearTimeout(Game.toastTimer);
    Game.toastTimer = setTimeout(function () {
      Game.els.captureToast.classList.add('hidden');
    }, 2800);
  }
};

Game.updateStealPage = function () {
  var pending = Game.getPendingEssence();
  var stats = Game.getStats();
  var risk = Game.getCaptureRiskPercent();
  var barFull = Game.isBarFull();
  var upgradesUnlocked = Game.state.hasStolenOnce;

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

  // 诅咒统计
  var gatePassed = Game.isCurseGatePassed();
  var timesComplete = Game.isCurseTimesComplete();
  Game.els.curseStats.classList.toggle('hidden', !timesComplete);
  if (timesComplete) {
    Game.els.curseTimesDisplay.textContent = Game.state.curseTimes;
    Game.els.cursePointsDisplay.textContent = Game.formatNumber(Game.state.cursePoints);
  }

  // 被诅咒的猎犬
  var pointsComplete = Game.isCursePointsGoalReached();
  if (pointsComplete) {
    Game.els.cursedHoundPanel.classList.remove('hidden');
    var cursedHoundRisk = Game.getCursedHoundRiskPercent();
    Game.els.cursedHoundRisk.textContent = cursedHoundRisk.toFixed(1) + '%';
    Game.els.cursedHoundBar.style.width = cursedHoundRisk + '%';
  } else {
    Game.els.cursedHoundPanel.classList.add('hidden');
  }
};

/* ===== 升级页渲染（原 cursePage.js） ===== */

Game.showCurseToast = function (title, body) {
  Game.els.toastBody.textContent = body;
  Game.els.captureToast.querySelector('.toast-title').textContent = title;
  Game.els.captureToast.classList.remove('hidden');

  if (Game.curseToastTimer) clearTimeout(Game.curseToastTimer);
  Game.curseToastTimer = setTimeout(function () {
    Game.els.captureToast.classList.add('hidden');
  }, 3200);
};

Game.getCurseShopSnapshot = function () {
  return Game.CURSE_SHOP.map(function (item) {
    return (
      item.id + ':' +
      Game.getCurseShopLevel(item.id) + ':' +
      Game.getCurseShopCost(item.id) + ':' +
      (Game.canAffordCurseShop(item.id) ? '1' : '0') + ':' +
      Game.state.cursePoints
    );
  }).join('|');
};

Game.renderCurseShopList = function () {
  var html = '';
  for (var i = 0; i < Game.CURSE_SHOP.length; i++) {
    var item = Game.CURSE_SHOP[i];
    var level = Game.getCurseShopLevel(item.id);
    var cost = Game.getCurseShopCost(item.id);
    var canBuy = Game.canAffordCurseShop(item.id);

    if (item.id === 'pointBonus') {
      var currentBonus = Math.round((Game.getCursePointBonusMultiplier() - 1) * 100);
      html +=
        '<div class="curse-shop-item">' +
        '<div class="curse-shop-info">' +
        '<div class="curse-shop-name">' + item.name + '</div>' +
        '<div class="curse-shop-desc">' + item.desc + ' ' + item.effectText + '</div>' +
        '<div class="curse-shop-level">等级 ' + level + '（当前 +' + currentBonus + '%）</div>' +
        '</div>' +
        '<button type="button" class="curse-shop-btn" data-curse-shop="' + item.id + '"' +
        (canBuy ? '' : ' disabled') + '>' +
        cost + ' 点数' +
        '</button>' +
        '</div>';
    } else if (item.id === 'equipSlots') {
      var currentSlots = Game.getMaxEquippedCursedParts();
      html +=
        '<div class="curse-shop-item">' +
        '<div class="curse-shop-info">' +
        '<div class="curse-shop-name">' + item.name + '</div>' +
        '<div class="curse-shop-desc">' + item.desc + ' ' + item.effectText + '</div>' +
        '<div class="curse-shop-level">等级 ' + level + '（当前 ' + currentSlots + ' 槽位）</div>' +
        '</div>' +
        '<button type="button" class="curse-shop-btn" data-curse-shop="' + item.id + '"' +
        (canBuy ? '' : ' disabled') + '>' +
        cost + ' 点数' +
        '</button>' +
        '</div>';
    } else if (item.id === 'partSell') {
      html +=
        '<div class="curse-shop-item">' +
        '<div class="curse-shop-info">' +
        '<div class="curse-shop-name">' + item.name + '</div>' +
        '<div class="curse-shop-desc">' + item.desc + '（浓度×0.5=出售点数）</div>' +
        '</div>' +
        '</div>';
    }
  }
  Game.curseEls.curseShopList.innerHTML = html;
};

Game.renderCurseShopIfNeeded = function () {
  var snapshot = Game.getCurseShopSnapshot();
  if (snapshot === Game.lastCurseShopSnapshot) return;
  Game.lastCurseShopSnapshot = snapshot;
  Game.renderCurseShopList();
};

Game.renderCursePartsList = function () {
  if (Game.state.cursedParts.length === 0) {
    Game.curseEls.cursePartsList.innerHTML = '<div class="parts-empty">尚无被诅咒部件</div>';
    return;
  }

  var html = '';
  var sorted = Game.state.cursedParts.slice().sort(function (a, b) {
    return b.concentration - a.concentration;
  });

  var equippedIds = Game.state.equippedCursedPartId ? Game.state.equippedCursedPartId.split(',') : [];

  for (var i = 0; i < sorted.length; i++) {
    var part = sorted[i];
    var isEquipped = equippedIds.indexOf(part.uid) !== -1;
    var tier = Game.getConcentrationTier(part.concentration);
    var curseLabel = Game.formatStatValue('timeCurse', part.timeCurseValue);
    var sellValue = Math.ceil(part.concentration * 0.5);

    html +=
      '<div class="curse-part-item' + (isEquipped ? ' equipped' : '') + '">' +
      '<div class="curse-part-main">' +
      '<span class="part-name">' + part.name + '</span>' +
      '<span class="part-concentration conc-' + tier + '">浓度 ' + part.concentration + '</span>' +
      '<span class="curse-part-effect">时间诅咒 ' + curseLabel + '</span>' +
      '</div>' +
      '<div class="curse-part-actions">' +
      '<button type="button" class="curse-equip-btn" data-equip="' + part.uid + '">' +
      (isEquipped ? '卸下' : '装备') +
      '</button>' +
      '<button type="button" class="curse-sell-btn" data-sell="' + part.uid + '">' +
      '出售+' + sellValue +
      '</button>' +
      '</div>' +
      '</div>';
  }

  Game.curseEls.cursePartsList.innerHTML = html;
};

Game.updateUpgradePage = function () {
  // 献祭面板
  var canSacrifice = Game.canSacrifice();
  var pointsPreview = Game.calcCursePointsGained(Game.state.total, Game.state.parts);
  Game.curseEls.sacrificePreview.textContent =
    '可献祭：时间本质 ' + Game.formatNumber(Game.state.total) +
    '，部件 ' + Game.state.parts.length + ' 件' +
    '（本次可获得 ' + pointsPreview + ' 诅咒点数）';
  Game.curseEls.sacrificeBtn.disabled = !canSacrifice;

  // 被诅咒部件
  Game.renderCursePartsList();

  // 诅咒商店
  var shopUnlocked = Game.isCurseTimesComplete();
  Game.curseEls.curseShopPanel.classList.toggle('hidden', !shopUnlocked);
  if (shopUnlocked) {
    Game.curseEls.cursePointsBalance.textContent = Game.formatNumber(Game.state.cursePoints);
    Game.renderCurseShopIfNeeded();
  }
};

/* ===== 进度页渲染 ===== */

Game.getAchievementsSnapshot = function () {
  return Game.ACHIEVEMENTS.map(function (a) {
    return a.id + ':' + (a.isComplete() ? '1' : '0');
  }).join('|');
};

Game.renderAchievementsIfNeeded = function () {
  var snapshot = Game.getAchievementsSnapshot();
  if (snapshot === Game.lastAchievementsSnapshot) return;
  Game.lastAchievementsSnapshot = snapshot;
  Game.renderAchievements();
};

Game.renderAchievements = function () {
  var html = '';
  for (var i = 0; i < Game.ACHIEVEMENTS.length; i++) {
    var achievement = Game.ACHIEVEMENTS[i];
    var complete = achievement.isComplete();
    html +=
      '<div class="achievement-item' + (complete ? ' completed' : '') + '">' +
      '<div class="achievement-info">' +
      '<div class="achievement-name">' + achievement.name + '</div>' +
      '<div class="achievement-desc">' + achievement.desc + '</div>' +
      '</div>' +
      '<span class="achievement-status ' + (complete ? 'done' : 'pending') + '">' +
      (complete ? '已完成' : '未完成') +
      '</span>' +
      '</div>';
  }
  Game.progressEls.achievementsList.innerHTML = html;
};

Game.renderStatsDetail = function () {
  var stats = Game.getStats();
  var html = '';

  var statItems = [
    { name: '时间本质', value: Game.formatNumber(Game.state.total) },
    { name: '时间流速', value: '×' + stats.timeFlow.toFixed(2) },
    { name: '窃取倍率', value: '×' + stats.stealMultiplier.toFixed(2) },
    { name: '幸运值', value: stats.luck },
    { name: '被捕获次数', value: Game.state.captureCount },
    { name: '被诅咒次数', value: Game.state.curseTimes },
    { name: '诅咒点数', value: Game.formatNumber(Game.state.cursePoints) },
    { name: '挑战完成', value: Game.state.challengesComplete },
  ];

  if (stats.timeCurse > 0) {
    statItems.push({ name: '时间诅咒', value: '×' + (1 + stats.timeCurse).toFixed(2) });
  }

  if (Game.state.paradoxMilestones > 0) {
    statItems.push({ name: '悖论点', value: Game.state.paradoxPoints });
    statItems.push({ name: '悖论加成', value: '全属性+' + (Game.state.paradoxMilestones * 10) + '%' });
  }

  for (var i = 0; i < statItems.length; i++) {
    html +=
      '<div class="stats-detail-item">' +
      '<span class="stat-name">' + statItems[i].name + '</span>' +
      '<span class="stat-value">' + statItems[i].value + '</span>' +
      '</div>';
  }

  Game.progressEls.statsDetailList.innerHTML = html;
};

Game.updateProgressPage = function () {
  Game.renderAchievementsIfNeeded();

  // 挑战面板
  var challengesUnlocked = Game.isChallengesUnlocked();
  Game.curseEls.curseChallengesPanel.classList.toggle('hidden', !challengesUnlocked);

  Game.renderStatsDetail();
};

/* ===== 总更新入口 ===== */

Game.updateUI = function () {
  var currentPage = Game.Navigation.getCurrentPage();

  if (currentPage === 'steal') {
    Game.updateStealPage();
  } else if (currentPage === 'upgrade') {
    Game.updateUpgradePage();
  } else if (currentPage === 'progress') {
    Game.updateProgressPage();
  }

  // 即使不在窃取页，也需要检查诅咒之门（后台逻辑）
  Game.checkCurseGate();
};

/* ===== 事件绑定 ===== */

Game.bindStealButton = function () {
  Game.els.stealBtn.addEventListener('click', function () {
    var result = Game.stealTime();
    if (result.paradox) {
      Game.forceRefreshLists();
      Game.showCaptureToast(result);
    } else if (result.bothCaught) {
      Game.forceRefreshLists();
      Game.showCaptureToast(result);
    } else if (result.cursedHoundCaught) {
      Game.showCaptureToast(result);
    } else if (result.captured) {
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

    var btn = event.target.closest('[data-upgrade]');
    if (!btn || btn.disabled) return;

    var id = btn.getAttribute('data-upgrade');
    if (Game.buyUpgrade(id)) {
      Game.save();
      Game.forceRefreshLists();
      Game.updateUI();
    }
  });
};

Game.bindCursePageButtons = function () {
  // 献祭按钮
  Game.curseEls.sacrificeBtn.addEventListener('click', function () {
    if (!Game.canSacrifice()) return;
    if (!confirm('确定献祭全部时间本质与猎犬部件？此操作不可撤销。')) return;

    var result = Game.performSacrifice();
    if (!result) return;

    Game.lastCurseShopSnapshot = '';
    Game.lastAchievementsSnapshot = '';
    Game.save();
    Game.showCurseToast(
      '诅咒降临',
      '获得 ' + result.part.name + '（浓度 ' + result.part.concentration +
      '，时间诅咒 全属性 ×' + (1 + result.part.timeCurseValue).toFixed(2) +
      '） +' + result.pointsGained + ' 诅咒点数'
    );
    Game.updateUI();
  });

  // 被诅咒部件列表事件（装备/出售）
  Game.curseEls.cursePartsList.addEventListener('pointerup', function (event) {
    if (event.button !== 0) return;

    var equipBtn = event.target.closest('[data-equip]');
    var sellBtn = event.target.closest('[data-sell]');

    if (equipBtn && !equipBtn.disabled) {
      var uid = equipBtn.getAttribute('data-equip');
      if (Game.equipCursedPart(uid)) {
        Game.save();
        Game.showCurseToast('装备更换', '已切换装备状态');
        Game.updateUI();
      }
    } else if (sellBtn && !sellBtn.disabled) {
      var sellUid = sellBtn.getAttribute('data-sell');
      var part = Game.state.cursedParts.find(function(p) { return p.uid === sellUid; });
      if (!part) return;

      if (!confirm('确定出售 ' + part.name + '（浓度 ' + part.concentration + '）？将获得 ' + Math.ceil(part.concentration * 0.5) + ' 诅咒点数。')) return;

      var pointsGained = Game.sellCursedPart(sellUid);
      Game.lastCurseShopSnapshot = '';
      Game.save();
      Game.showCurseToast('出售成功', '获得 ' + pointsGained + ' 诅咒点数');
      Game.updateUI();
    }
  });

  // 诅咒商店事件
  Game.curseEls.curseShopList.addEventListener('pointerup', function (event) {
    if (event.button !== 0) return;
    var btn = event.target.closest('[data-curse-shop]');
    if (!btn || btn.disabled) return;

    var id = btn.getAttribute('data-curse-shop');
    if (Game.buyCurseShopUpgrade(id)) {
      Game.lastCurseShopSnapshot = '';
      Game.save();
      Game.showCurseToast('购买成功', '诅咒增幅已提升');
      Game.updateUI();
    }
  });

  // 挑战按钮
  Game.curseEls.challengeBtn.addEventListener('click', function () {
    Game.state.challengesComplete += 1;
    Game.lastAchievementsSnapshot = '';
    Game.save();
    Game.showCurseToast('挑战完成', '已完成 ' + Game.state.challengesComplete + ' 个挑战');
    Game.updateUI();
  });
};

Game.bindSettingsButtons = function () {
  Game.els.resetSaveBtn.addEventListener('click', function () {
    if (Game.resetSave()) {
      Game.Navigation.switchTo('steal');
    }
  });
};
