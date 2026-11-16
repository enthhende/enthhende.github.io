/* One game entry supplies both views; only the chosen view is remembered. */
(() => {
  'use strict';
  const catalog = document.querySelector('#gameCatalog');
  if (!catalog) return;
  const games = [...catalog.querySelectorAll('.gameCard')];
  const search = document.querySelector('#gameSearch');
  const count = document.querySelector('#gameResultCount');
  const empty = document.querySelector('#gameEmpty');
  const columns = document.querySelector('.catalog-columns');
  const views = [...document.querySelectorAll('[data-view-switch]')];
  const platforms = [...document.querySelectorAll('[data-platform]')];
  const storageKey = 'enthhende-home-view';
  let platform = 'all';
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\s·:_()\-]/g, '');
  const records = games.map(element => ({
    element,
    title: normalize(element.dataset.title || element.querySelector('h3').textContent),
    platforms: (element.dataset.platforms || '').split(' ')
  }));

  function setView(view, remember = false) {
    if (view !== 'cards') view = 'list';
    catalog.dataset.view = view;
    columns.hidden = view !== 'list';
    views.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.viewSwitch === view)));
    if (remember) {
      try { localStorage.setItem(storageKey, view); } catch (_) { /* Viewing still works without storage. */ }
    }
  }

  function filter() {
    const query = normalize(search.value);
    let visible = 0;
    records.forEach(record => {
      const matches = (platform === 'all' || record.platforms.includes(platform)) && record.title.includes(query);
      record.element.hidden = !matches;
      if (matches) visible += 1;
    });
    count.textContent = `${visible}개 게임${visible === games.length ? '' : ` / 전체 ${games.length}개`}`;
    empty.hidden = visible !== 0;
    columns.hidden = visible === 0 || catalog.dataset.view !== 'list';
    platforms.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.platform === platform)));
  }

  function reset() {
    platform = 'all';
    search.value = '';
    filter();
  }

  let savedView = 'list';
  try { savedView = localStorage.getItem(storageKey) || 'list'; } catch (_) { /* Default to the list. */ }
  setView(savedView);
  views.forEach(button => button.addEventListener('click', () => {
    setView(button.dataset.viewSwitch, true);
    filter();
  }));
  platforms.forEach(button => button.addEventListener('click', () => {
    platform = button.dataset.platform;
    filter();
  }));
  search.addEventListener('input', filter);
  document.querySelector('#resetGameFilters').addEventListener('click', () => {
    reset();
    search.focus();
  });
  // A bookmark must still reach its game after filtering hid that entry.
  document.querySelectorAll('.home-bookmarks a').forEach(link => link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (target && target.hidden) reset();
  }));
  filter();
  document.querySelector('.catalog-tools').hidden = false;
})();
