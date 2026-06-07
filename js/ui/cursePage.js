Game.els = {
  sacrificePreview: document.getElementById('sacrifice-preview'),
  sacrificeBtn: document.getElementById('sacrifice-btn'),
  cursePartsList: document.getElementById('curse-parts-list'),
  curseShopPanel: document.getElementById('curse-shop-panel'),
  cursePointsBalance: document.getElementById('curse-points-balance'),
  curseShopList: document.getElementById('curse-shop-list'),
  curseToast: document.getElementById('curse-toast'),
  curseToastTitle: document.getElementById('curse-toast-title'),
  curseToastBody: document.getElementById('curse-toast-body'),
  // 新添加：挑战面板
  curseChallengesPanel: document.getElementById('curse-challenges-panel'),
  challengeBtn: document.getElementById('challenge-btn'),
};

Game.curseToastTimer = null;
Game.lastCurseShopSnapshot = '';

Game.formatNumber = function (value) {
  if (value < 1000) {
    return value.toFixed(1).replace(/\.0$/, '');
  }
  return Math.floor(value).toLocaleString('zh-CN');
};

Game.showCurseToast = function (title, body) {
  Game.els.curseToastTitle.textContent = title;
  Game.els.curseToastBody.textContent = body;
  Game.els.curseToast.classList.remove('hidden');

  if (Game.curseToastTimer) clearTimeout(Game.curseToastTimer);
  Game.curseToastTimer = setTimeout(function () {
    Game.els.curseToast.classList.add('hidden');
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
  let html = '';
  for (let i = 0; i < Game.CURSE_SHOP.length; i++) {
    const item = Game.CURSE_SHOP[i];
    const level = Game.getCurseShopLevel(item.id);
    const cost = Game.getCurseShopCost(item.id);
    const canBuy = Game.canAffordCurseShop(item.id);
    
    if (item.id === 'pointBonus') {
      const currentBonus = Math.round((Game.getCursePointBonusMultiplier() - 1) * 100);
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
      const currentSlots = Game.getMaxEquippedCursedParts();
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
  Game.els.curseShopList.innerHTML = html;
};

Game.renderCurseShopIfNeeded = function () {
  const snapshot = Game.getCurseShopSnapshot();
  if (snapshot === Game.lastCurseShopSnapshot) return;
  Game.lastCurseShopSnapshot = snapshot;
  Game.renderCurseShopList();
};

Game.renderCursePartsList = function () {
  if (Game.state.cursedParts.length === 0) {
    Game.els.cursePartsList.innerHTML = '<div class="parts-empty">尚无被诅咒部件</div>';
    return;
  }

  let html = '';
  const sorted = Game.state.cursedParts.slice().sort(function (a, b) {
    return b.concentration - a.concentration;
  });

  const equippedIds = Game.state.equippedCursedPartId ? Game.state.equippedCursedPartId.split(',') : [];
  const maxSlots = Game.getMaxEquippedCursedParts();

  for (let i = 0; i < sorted.length; i++) {
    const part = sorted[i];
    const isEquipped = equippedIds.indexOf(part.uid) !== -1;
    const tier = Game.getConcentrationTier(part.concentration);
    const curseLabel = Game.formatStatValue('timeCurse', part.timeCurseValue);
    const sellValue = Math.ceil(part.concentration * 0.5);

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

  Game.els.cursePartsList.innerHTML = html;
};

Game.updateCursePage = function () {
  if (!Game.isCurseGatePassed()) {
    window.location.href = 'index.html';
    return;
  }

  const canSacrifice = Game.canSacrifice();
  const pointsPreview = Game.calcCursePointsGained(Game.state.total, Game.state.parts);
  Game.els.sacrificePreview.textContent =
    '可献祭：时间本质 ' + Game.formatNumber(Game.state.total) +
    '，部件 ' + Game.state.parts.length + ' 件' +
    '（本次可获得 ' + pointsPreview + ' 诅咒点数）';
  Game.els.sacrificeBtn.disabled = !canSacrifice;

  Game.renderCursePartsList();

  const shopUnlocked = Game.isCurseTimesComplete();
  Game.els.curseShopPanel.classList.toggle('hidden', !shopUnlocked);
  if (shopUnlocked) {
    Game.els.cursePointsBalance.textContent = Game.formatNumber(Game.state.cursePoints);
    Game.renderCurseShopIfNeeded();
  }

  // 新添加：挑战面板显示
  const challengesUnlocked = Game.isChallengesUnlocked();
  Game.els.curseChallengesPanel.classList.toggle('hidden', !challengesUnlocked);
};

Game.bindCursePage = function () {
  Game.els.sacrificeBtn.addEventListener('click', function () {
    if (!Game.canSacrifice()) return;
    if (!confirm('确定献祭全部时间本质与猎犬部件？此操作不可撤销。')) return;

    const result = Game.performSacrifice();
    if (!result) return;

    Game.lastCurseShopSnapshot = '';
    Game.save();
    Game.showCurseToast(
      '诅咒降临',
      '获得 ' + result.part.name + '（浓度 ' + result.part.concentration +
      '，时间诅咒 全属性 ×' + (1 + result.part.timeCurseValue).toFixed(2) +
      '） +' + result.pointsGained + ' 诅咒点数'
    );
    Game.updateCursePage();
  });

  Game.els.cursePartsList.addEventListener('pointerup', function (event) {
    if (event.button !== 0) return;
    
    const equipBtn = event.target.closest('[data-equip]');
    const sellBtn = event.target.closest('[data-sell]');
    
    if (equipBtn && !equipBtn.disabled) {
      const uid = equipBtn.getAttribute('data-equip');
      if (Game.equipCursedPart(uid)) {
        Game.save();
        Game.showCurseToast('装备更换', '已切换装备状态');
        Game.updateCursePage();
      }
    } else if (sellBtn && !sellBtn.disabled) {
      const uid = sellBtn.getAttribute('data-sell');
      const part = Game.state.cursedParts.find(function(p) { return p.uid === uid; });
      if (!part) return;
      
      if (!confirm('确定出售 ' + part.name + '（浓度 ' + part.concentration + '）？将获得 ' + Math.ceil(part.concentration * 0.5) + ' 诅咒点数。')) return;
      
      const pointsGained = Game.sellCursedPart(uid);
      Game.lastCurseShopSnapshot = '';
      Game.save();
      Game.showCurseToast('出售成功', '获得 ' + pointsGained + ' 诅咒点数');
      Game.updateCursePage();
    }
  });

  Game.els.curseShopList.addEventListener('pointerup', function (event) {
    if (event.button !== 0) return;
    const btn = event.target.closest('[data-curse-shop]');
    if (!btn || btn.disabled) return;

    const id = btn.getAttribute('data-curse-shop');
    if (Game.buyCurseShopUpgrade(id)) {
      Game.lastCurseShopSnapshot = '';
      Game.save();
      Game.showCurseToast('购买成功', '诅咒增幅已提升');
      Game.updateCursePage();
    }
  });
};

Game.load();
Game.bindCursePage();
Game.updateCursePage();
