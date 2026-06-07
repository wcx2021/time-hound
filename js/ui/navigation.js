Game.Navigation = {
  pages: ['steal', 'upgrade', 'progress', 'settings'],
  currentPage: 'steal',
};

Game.Navigation.init = function () {
  var tabNav = document.getElementById('tab-nav');
  tabNav.addEventListener('click', function (e) {
    var btn = e.target.closest('.tab-btn');
    if (!btn || btn.disabled) return;
    var page = btn.getAttribute('data-page');
    Game.Navigation.switchTo(page);
  });

  // 从 hash 恢复页面
  var hash = window.location.hash.replace('#', '');
  if (Game.Navigation.pages.indexOf(hash) !== -1) {
    Game.Navigation.switchTo(hash, true);
  }
};

Game.Navigation.switchTo = function (page, skipHash) {
  if (Game.Navigation.pages.indexOf(page) === -1) return;

  Game.Navigation.currentPage = page;

  // 更新 Tab 按钮状态
  var btns = document.querySelectorAll('.tab-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].classList.toggle('active', btns[i].getAttribute('data-page') === page);
  }

  // 切换子页面显示
  var sections = document.querySelectorAll('.page-section');
  for (var j = 0; j < sections.length; j++) {
    sections[j].classList.toggle('active', sections[j].id === 'page-' + page);
  }

  // 更新 URL hash
  if (!skipHash) {
    window.location.hash = page;
  }

  // 切换后刷新当前页面的UI，清除快照缓存确保数据最新
  if (Game.forceRefreshLists) {
    Game.forceRefreshLists();
  }
  if (Game.updateUI) {
    Game.updateUI();
  }
};

Game.Navigation.getCurrentPage = function () {
  return Game.Navigation.currentPage;
};
