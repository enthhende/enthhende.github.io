/* Decorative images only; the walkthrough data and controls live in moon-guide.js. */
(() => {
  'use strict';
  const pixels = 'assets/pixels/';
  const image = (name, className) => {
    const img = document.createElement('img');
    img.src = pixels + name + '.png';
    img.alt = '';
    img.setAttribute('aria-hidden', 'true');
    img.className = className;
    img.decoding = 'async';
    return img;
  };

  const days = window.MOON_GUIDE_DATA.days;
  document.querySelectorAll('#dayLegend .dayChip').forEach((chip, i) => {
    if (days[i]) chip.prepend(image('day-' + days[i].id, 'moonDayIcon'));
  });
  document.querySelectorAll('#dayTabs [data-day]').forEach(tab => {
    if (days.some(day => day.id === tab.dataset.day)) {
      tab.prepend(image('day-' + tab.dataset.day, 'moonDayIcon'));
    }
  });

  const heads = {
    start: 'boy-sitting', tips: 'bread', schedule: 'day-echo',
    love: 'love-heart', animals: 'animal-book', md: 'md-player',
    items: 'cookies', kiban: 'pointer-hand', areas: 'yoshida-walking'
  };
  Object.entries(heads).forEach(([section, sprite]) => {
    const head = document.querySelector('#' + section + ' .sectionHead');
    if (head) head.prepend(image(sprite, 'moonSectionArt'));
  });

  const itemIcons = {'식빵': 'bread', '수제 쿠키': 'cookies', '몬스터 도감': 'animal-book'};
  document.querySelectorAll('#itemBody .primaryName').forEach(name => {
    const sprite = itemIcons[name.textContent.trim()];
    if (sprite) name.prepend(image(sprite, 'moonItemIcon'));
  });
})();
