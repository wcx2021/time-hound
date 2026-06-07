var TICK_MS = 50;
var SAVE_INTERVAL_MS = 5000;

Game.load();
Game.Navigation.init();
Game.checkCurseGate();
Game.bindStealButton();
Game.bindUpgradeButtons();
Game.bindCursePageButtons();
Game.bindSettingsButtons();
Game.updateUI();

setInterval(function () {
  Game.updateUI();
}, TICK_MS);

setInterval(function () {
  Game.save();
}, SAVE_INTERVAL_MS);

window.addEventListener('beforeunload', function () {
  Game.save();
});

// curse.html 重定向：如果有人直接访问 curse.html，跳转到主页面
if (window.location.pathname.indexOf('curse.html') !== -1) {
  window.location.href = 'index.html#upgrade';
}
