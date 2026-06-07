var TICK_MS = 50;
var SAVE_INTERVAL_MS = 5000;

Game.load();
Game.checkCurseGate();
Game.bindStealButton();
Game.bindUpgradeButtons();
Game.bindCurseButton();
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
