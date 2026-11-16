/* Game articles supply both views. Optional series metadata only groups them. */
(() => {
  'use strict';
  const catalog = document.querySelector('#gameCatalog');
  if (!catalog) return;
  const games = [...catalog.querySelectorAll('.gameCard')].filter(element => {
    const published = element.dataset.published !== 'false';
    if (!published) element.hidden = true;
    return published;
  });
  const search = document.querySelector('#gameSearch');
  const count = document.querySelector('#gameResultCount');
  const empty = document.querySelector('#gameEmpty');
  const columns = document.querySelector('.catalog-columns');
  const views = [...document.querySelectorAll('[data-view-switch]')];
  const platforms = [...document.querySelectorAll('[data-platform]')];
  const storageKey = 'enthhende-home-view';
  let platform = 'all';
  let visibleCount = games.length;
  const normalize = value => value.normalize('NFKC').toLowerCase().replace(/[\s·:_()\-]/g, '');
  const definitions = JSON.parse(document.querySelector('#catalogSeriesData')?.textContent || '{}');
  const groups = new Map();
  const platformNames = platforms.filter(button => button.dataset.platform !== 'all')
    .map(button => [button.dataset.platform, button.textContent.trim()]);
  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function seriesGroup(id, definition, firstGame) {
    const element = node('details', 'catalog-series');
    element.id = 'series-' + id;
    const summary = node('summary', 'series-summary');
    const heading = node('span', 'series-heading');
    const art = node('span', 'series-art');
    if (definition.image) {
      const image = node('img', '');
      image.src = definition.image;
      image.alt = '';
      image.loading = 'lazy';
      art.append(image);
    } else {
      art.textContent = definition.icon || '📚';
    }
    art.setAttribute('aria-hidden', 'true');
    const copy = node('span', 'series-copy');
    const title = node('strong', 'series-title', definition.title);
    title.id = element.id + '-title';
    copy.append(node('small', 'series-kicker', '시리즈'), title);
    if (definition.description) copy.append(node('span', 'series-description', definition.description));
    heading.append(art, copy);
    const badges = node('span', 'game-platforms series-platforms');
    badges.setAttribute('aria-label', '게임 기종');
    const count = node('span', 'series-count');
    const action = node('span', 'series-action');
    const arrow = node('span', 'series-chevron', '▸');
    arrow.setAttribute('aria-hidden', 'true');
    action.append(node('span', 'series-open-label', '작품 보기'), node('span', 'series-close-label', '접기'), arrow);
    summary.append(heading, badges, count, action);
    const children = node('div', 'series-games');
    element.setAttribute('aria-labelledby', title.id);
    element.append(summary, children);
    firstGame.before(element);
    const group = {element, children, badges, count, records: [], manualOpen: false};
    // Native summary clicks also cover Enter/Space; programmatic filtering never
    // overwrites the user's unfiltered open/closed choice.
    summary.addEventListener('click', () => {
      if (!normalize(search.value) && platform === 'all') group.manualOpen = !element.open;
    });
    return group;
  }

  const records = games.map(element => ({
    element,
    title: normalize(element.dataset.title || element.querySelector('h3').textContent),
    platforms: (element.dataset.platforms || '').split(' '),
    series: element.dataset.series || ''
  }));
  records.forEach(record => {
    const definition = definitions[record.series];
    if (!record.series || !definition?.title) return; // Unassigned games remain standalone.
    if (!groups.has(record.series)) groups.set(record.series, seriesGroup(record.series, definition, record.element));
    const group = groups.get(record.series);
    record.title += normalize(definition.title + ' ' + (definition.aliases || []).join(' '));
    group.records.push(record);
    group.children.append(record.element);
  });

  function setView(view, remember = false) {
    if (view !== 'cards') view = 'list';
    catalog.dataset.view = view;
    columns.hidden = view !== 'list' || visibleCount === 0;
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
    const filtered = query !== '' || platform !== 'all';
    groups.forEach(group => {
      const matching = group.records.filter(record => !record.element.hidden);
      group.element.hidden = matching.length === 0;
      group.element.open = filtered ? matching.length > 0 : group.manualOpen;
      group.count.textContent = matching.length === group.records.length
        ? `${matching.length}개 작품` : `${matching.length} / ${group.records.length}개 작품`;
      const present = new Set(matching.flatMap(record => record.platforms));
      group.badges.replaceChildren(...platformNames.filter(([id]) => present.has(id))
        .map(([, label]) => node('span', '', label)));
    });
    visibleCount = visible;
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
  // Bookmarks/deep links reveal both a filtered record and a collapsed parent.
  function revealTarget(hash) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch (_) { return null; }
    const target = document.getElementById(id);
    if (!target || !target.matches('.gameCard, .catalog-series')) return null;
    if (target.dataset.published === 'false') return null;
    const parent = target.closest('.catalog-series');
    if (target.hidden || parent?.hidden) reset();
    if (parent) {
      parent.open = true;
      for (const group of groups.values()) {
        if (group.element === parent) group.manualOpen = true;
      }
    }
    return target;
  }
  document.querySelectorAll('.home-bookmarks a').forEach(link => link.addEventListener('click', () => {
    revealTarget(link.hash);
  }));
  window.addEventListener('hashchange', () => {
    const target = revealTarget(location.hash);
    if (target) target.scrollIntoView({block: 'start'});
  });
  filter();
  const target = revealTarget(location.hash);
  if (target) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  document.querySelector('.catalog-tools').hidden = false;
})();
