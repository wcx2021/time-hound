/**
 * 开发者模式 — 仅用于测试
 * 发布时删除：index.html 底部 DEV MODE 区块、本文件、css/dev.css
 */
(function () {
  if (typeof Game === 'undefined') return;

  var panelOpen = false;

  var CONFIG_FIELDS = [
    { key: 'essencePerSecond', label: '每秒基础积累', step: 0.1 },
    { key: 'barFillSeconds', label: '进度条满格秒数', step: 1 },
    { key: 'baseStealCapture', label: '窃取捕获系数', step: 0.01 },
    { key: 'captureGrowthPerSecond', label: '捕获增长系数', step: 0.01 },
    { key: 'maxLuckCaptureReduction', label: '幸运最大减免', step: 0.05 },
    { key: 'curseThreshold', label: '诅咒门槛', step: 100 },
    { key: 'curseTimesGoal', label: '被诅咒目标次数', step: 1 },
    { key: 'cursePointsGoal', label: '诅咒点数目标', step: 1000 },
    { key: 'baseCursePointsPerSacrifice', label: '每次诅咒基础点数', step: 1 },
  ];

  function refreshGame() {
    if (Game.forceRefreshLists) Game.forceRefreshLists();
    if (Game.updateUI) Game.updateUI();
    if (Game.save) Game.save();
    syncPanel();
  }

  function numInput(id, value, step) {
    return (
      '<input class="dev-input" type="number" id="dev-' + id + '" ' +
      'value="' + value + '" step="' + (step || 1) + '">'
    );
  }

  function buildPanelHTML() {
    var html = '';

    html += '<div class="dev-section"><div class="dev-section-title">快捷操作</div><div class="dev-actions">';
    html += '<button type="button" class="dev-action-btn" data-action="essence-100">+100 本质</button>';
    html += '<button type="button" class="dev-action-btn" data-action="essence-1k">+1,000 本质</button>';
    html += '<button type="button" class="dev-action-btn" data-action="essence-10k">+10,000 本质</button>';
    html += '<button type="button" class="dev-action-btn" data-action="pass-curse-gate">通过诅咒之门</button>';
    html += '<button type="button" class="dev-action-btn" data-action="curse-plus">+1 被诅咒</button>';
    html += '<button type="button" class="dev-action-btn" data-action="complete-curses">完成10次诅咒</button>';
    html += '<button type="button" class="dev-action-btn" data-action="curse-points-1k">+1000 诅咒点数</button>';
    html += '<button type="button" class="dev-action-btn" data-action="fill-pending">填满待窃取</button>';
    html += '<button type="button" class="dev-action-btn" data-action="unlock-steal">解锁窃取/升级</button>';
    html += '<button type="button" class="dev-action-btn" data-action="simulate-capture">模拟捕获</button>';
    html += '<button type="button" class="dev-action-btn" data-action="random-part">随机部件</button>';
    html += '<button type="button" class="dev-action-btn dev-danger" data-action="clear-parts">清空部件</button>';
    html += '<button type="button" class="dev-action-btn dev-danger" data-action="reset-save">重置存档</button>';
    html += '</div></div>';

    html += '<div class="dev-section"><div class="dev-section-title">游戏状态</div><div class="dev-grid">';
    html += '<label>时间本质</label>' + numInput('total', Game.state.total, 1);
    html += '<label>被捕获次数</label>' + numInput('captureCount', Game.state.captureCount, 1);
    html += '<label>被诅咒次数</label>' + numInput('curseTimes', Game.state.curseTimes, 1);
    html += '<label>诅咒点数</label>' + numInput('cursePoints', Game.state.cursePoints, 1);
    html += '<label>诅咒门已通过</label><select class="dev-input" id="dev-curseGatePassed"><option value="0">否</option><option value="1">是</option></select>';
    html += '<label>已窃取过</label><select class="dev-input" id="dev-hasStolenOnce"><option value="0">否</option><option value="1">是</option></select>';
    html += '</div><button type="button" class="dev-apply-btn" data-apply="state">应用状态</button></div>';

    html += '<div class="dev-section"><div class="dev-section-title">全局配置 CONFIG</div><div class="dev-grid">';
    for (var i = 0; i < CONFIG_FIELDS.length; i++) {
      var field = CONFIG_FIELDS[i];
      html += '<label>' + field.label + '</label>' + numInput('cfg-' + field.key, Game.CONFIG[field.key], field.step);
    }
    html += '</div><button type="button" class="dev-apply-btn" data-apply="config">应用配置</button></div>';

    html += '<div class="dev-section"><div class="dev-section-title">升级等级</div><div class="dev-grid">';
    for (var j = 0; j < Game.UPGRADES.length; j++) {
      var upgrade = Game.UPGRADES[j];
      html += '<label>' + upgrade.name + '</label>' + numInput('up-' + upgrade.id, Game.getUpgradeLevel(upgrade.id), 1);
    }
    html += '</div><button type="button" class="dev-apply-btn" data-apply="upgrades">应用升级</button></div>';

    return html;
  }

  function syncPanel() {
    var panel = document.getElementById('dev-panel');
    if (!panel || !panelOpen) return;

    setVal('dev-total', Game.state.total);
    setVal('dev-captureCount', Game.state.captureCount);
    setVal('dev-curseTimes', Game.state.curseTimes);
    setVal('dev-cursePoints', Game.state.cursePoints);
    setSelect('dev-curseGatePassed', Game.state.curseGatePassed ? '1' : '0');
    setSelect('dev-hasStolenOnce', Game.state.hasStolenOnce ? '1' : '0');

    for (var i = 0; i < CONFIG_FIELDS.length; i++) {
      var key = CONFIG_FIELDS[i].key;
      setVal('dev-cfg-' + key, Game.CONFIG[key]);
    }

    for (var j = 0; j < Game.UPGRADES.length; j++) {
      var id = Game.UPGRADES[j].id;
      setVal('dev-up-' + id, Game.getUpgradeLevel(id));
    }
  }

  function setVal(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value;
  }

  function setSelect(id, value) {
    var el = document.getElementById(id);
    if (el) el.value = value;
  }

  function readNumber(id) {
    return Number(document.getElementById(id).value);
  }

  function applyState() {
    Game.state.total = Math.max(0, readNumber('dev-total'));
    Game.state.captureCount = Math.max(0, Math.floor(readNumber('dev-captureCount')));
    Game.state.curseTimes = Math.max(0, Math.floor(readNumber('dev-curseTimes')));
    Game.state.cursePoints = Math.max(0, Math.floor(readNumber('dev-cursePoints')));
    Game.state.curseGatePassed = document.getElementById('dev-curseGatePassed').value === '1';
    Game.checkCurseGate();
    Game.state.hasStolenOnce = document.getElementById('dev-hasStolenOnce').value === '1';
    refreshGame();
  }

  function applyConfig() {
    for (var i = 0; i < CONFIG_FIELDS.length; i++) {
      var key = CONFIG_FIELDS[i].key;
      var val = readNumber('dev-cfg-' + key);
      if (!isNaN(val)) Game.CONFIG[key] = val;
    }
    refreshGame();
  }

  function applyUpgrades() {
    for (var j = 0; j < Game.UPGRADES.length; j++) {
      var id = Game.UPGRADES[j].id;
      Game.state.upgrades[id] = Math.max(0, Math.floor(readNumber('dev-up-' + id)));
    }
    refreshGame();
  }

  function runAction(action) {
    switch (action) {
      case 'essence-100':
        Game.state.total += 100;
        break;
      case 'essence-1k':
        Game.state.total += 1000;
        break;
      case 'essence-10k':
        Game.state.total += 10000;
        break;
      case 'fill-curse':
        Game.state.total = Game.CONFIG.curseThreshold;
        Game.checkCurseGate();
        break;
      case 'pass-curse-gate':
        Game.state.total = Math.max(Game.state.total, Game.CONFIG.curseThreshold);
        Game.state.curseGatePassed = true;
        break;
      case 'curse-plus':
        Game.state.curseTimes += 1;
        // 开发者模式直接给1000点
        Game.state.cursePoints += 1000;
        break;
      case 'complete-curses':
        Game.state.curseTimes = Game.CONFIG.curseTimesGoal;
        break;
      case 'curse-points-1k':
        Game.state.cursePoints += 1000;
        break;
      case 'fill-pending':
        Game.state.lastStealTime = Date.now() - Game.getBarFillSeconds() * 1000;
        break;
      case 'unlock-steal':
        Game.state.hasStolenOnce = true;
        break;
      case 'simulate-capture':
        Game.triggerCapture();
        if (Game.forceRefreshLists) Game.forceRefreshLists();
        break;
      case 'random-part': {
        var template = Game.PART_POOL[Math.floor(Math.random() * Game.PART_POOL.length)];
        Game.addOrMergePart(template, Game.rollConcentration());
        if (Game.forceRefreshLists) Game.forceRefreshLists();
        break;
      }
      case 'clear-parts':
        Game.state.parts = [];
        if (Game.forceRefreshLists) Game.forceRefreshLists();
        break;
      case 'reset-save':
        if (confirm('确定重置存档？')) {
          if (Game.clearSave) Game.clearSave();
          location.reload();
          return;
        }
        break;
    }
    refreshGame();
  }

  function togglePanel() {
    panelOpen = !panelOpen;
    var panel = document.getElementById('dev-panel');
    var toggle = document.getElementById('dev-toggle');
    if (panel) panel.classList.toggle('open', panelOpen);
    if (toggle) toggle.classList.toggle('active', panelOpen);
    if (panelOpen) syncPanel();
  }

  function init() {
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = 'dev-toggle';
    toggle.className = 'dev-toggle';
    toggle.textContent = 'DEV';
    toggle.title = '开发者模式';

    var panel = document.createElement('div');
    panel.id = 'dev-panel';
    panel.className = 'dev-panel';
    panel.innerHTML =
      '<div class="dev-panel-header">' +
      '<span>开发者模式</span>' +
      '<button type="button" class="dev-close" id="dev-close">×</button>' +
      '</div>' +
      '<div class="dev-panel-body">' + buildPanelHTML() + '</div>';

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    toggle.addEventListener('click', togglePanel);
    document.getElementById('dev-close').addEventListener('click', togglePanel);

    panel.addEventListener('click', function (event) {
      var actionBtn = event.target.closest('[data-action]');
      if (actionBtn) {
        runAction(actionBtn.getAttribute('data-action'));
        return;
      }

      var applyBtn = event.target.closest('[data-apply]');
      if (!applyBtn) return;

      var type = applyBtn.getAttribute('data-apply');
      if (type === 'state') applyState();
      if (type === 'config') applyConfig();
      if (type === 'upgrades') applyUpgrades();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
