'use strict';
(() => {
  const search = document.getElementById('guideSearch');
  if (!search) return;
  const chapters = [...document.querySelectorAll('.chapter')];
  const status = document.getElementById('searchStatus');
  const empty = document.getElementById('noResults');
  const normal = s => s.normalize('NFKC').toLocaleLowerCase('ko').replace(/\s+/g, ' ').trim();
  // Search the complete text, but return chapter names only. Never open stages.
  const haystacks = chapters.map(ch => normal(ch.textContent));
  chapters.forEach(ch => {
    const body = ch.querySelector('.chapterBody');
    const stages = [...body.querySelectorAll('.guideStage')].map((fallback, i) => {
      const stage = document.createElement('section');
      stage.className = 'guideStage';
      stage.id = fallback.id;
      const heading = document.createElement('h3');
      heading.className = 'stageNumber';
      heading.id = `${stage.id}-heading`;
      heading.tabIndex = -1;
      heading.textContent = `${i + 1}단계`;
      stage.setAttribute('aria-labelledby', heading.id);
      stage.append(heading, fallback.querySelector('.stageContent'));
      fallback.replaceWith(stage);
      stage.hidden = i > 0;
      return stage;
    });
    if (!stages.length) return;
    let visible = 1;
    const progress = document.createElement('p');
    progress.className = 'stageProgress tiny';
    progress.id = `${ch.id}-progress`;
    progress.setAttribute('role', 'status');
    progress.setAttribute('aria-live', 'polite');
    progress.setAttribute('aria-atomic', 'true');
    const controls = document.createElement('div');
    controls.className = 'stageControls';
    const next = document.createElement('button');
    next.type = 'button'; next.className = 'btn stageNext';
    next.textContent = '다음 단계 보기';
    next.setAttribute('aria-describedby', progress.id);
    const all = document.createElement('button');
    all.type = 'button'; all.className = 'stageSmall stageAll';
    all.textContent = '이 화 전체 펼치기';
    all.setAttribute('aria-controls', stages.map(s => s.id).join(' '));
    const restart = document.createElement('button');
    restart.type = 'button'; restart.className = 'stageSmall stageRestart';
    restart.textContent = '첫 단계만 보기';
    restart.setAttribute('aria-controls', stages.map(s => s.id).join(' '));
    controls.append(next, all, restart);
    const footer = body.querySelector('.chapterFooter');
    body.insertBefore(progress, footer);
    body.insertBefore(controls, footer);
    function update() {
      stages.forEach((stage, i) => { stage.hidden = i >= visible; });
      progress.textContent = `${stages.length}단계 중 ${visible}단계까지 펼쳤습니다.`;
      next.hidden = all.hidden = visible === stages.length;
      restart.hidden = visible === 1;
      if (visible < stages.length) next.setAttribute('aria-controls', stages[visible].id);
      else next.removeAttribute('aria-controls');
    }
    function focusStage(index) {
      // Keep reading position stable. Keyboard users land at the newly revealed text.
      stages[index].querySelector('.stageNumber').focus({preventScroll: true});
    }
    next.addEventListener('click', () => { const index = visible++; update(); focusStage(index); });
    all.addEventListener('click', () => { const index = visible; visible = stages.length; update(); focusStage(index); });
    restart.addEventListener('click', () => {
      visible = 1;
      body.querySelectorAll('.spoiler[open]').forEach(detail => { detail.open = false; });
      update(); focusStage(0);
      stages[0].scrollIntoView({block: 'nearest', behavior: 'instant'});
    });
    update();
  });
  function filter() {
    const query = normal(search.value);
    let count = 0;
    chapters.forEach((ch, i) => {
      const match = !query || query.split(' ').every(word => haystacks[i].includes(word));
      ch.hidden = !match;
      if (match) count++;
    });
    if (status) status.textContent = query ? `${count}개 화에서 찾았습니다. 제목을 눌러 첫 단계부터 확인하세요. 숨긴 단계와 스포일러는 자동으로 열리지 않습니다.` : '1~8화 본문을 검색합니다. 결과는 화 제목만 표시하며 숨긴 내용은 펼치지 않습니다.';
    if (empty) empty.hidden = count !== 0;
  }
  function revealTarget() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target) return;
    const chapter = target.closest('.chapter');
    if (chapter) {
      search.value = ''; filter(); chapter.open = true;
      // A deep link must not expose an unrevealed step or ending.
      requestAnimationFrame(() => {
        const summary = chapter.querySelector('summary');
        summary.focus({preventScroll: true});
        chapter.scrollIntoView({block: 'start'});
      });
    }
    document.querySelectorAll('.chapterNav a').forEach(a => {
      if (a.hash === location.hash) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
  }
  // Native links retain Tab/Enter behavior; arrows also move within the index.
  const chapterLinks = [...document.querySelectorAll('.chapterNav a')];
  chapterLinks.forEach((link, i) => link.addEventListener('keydown', e => {
    let index;
    if (e.key === 'ArrowDown') index = Math.min(i + 1, chapterLinks.length - 1);
    else if (e.key === 'ArrowUp') index = Math.max(i - 1, 0);
    else if (e.key === 'Home') index = 0;
    else if (e.key === 'End') index = chapterLinks.length - 1;
    else return;
    e.preventDefault();
    chapterLinks[index].focus();
  }));
  search.addEventListener('input', filter);
  search.addEventListener('keydown', e => { if (e.key === 'Escape') { search.value = ''; filter(); } });
  document.getElementById('clearSearch').addEventListener('click', () => { search.value = ''; filter(); search.focus(); });
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { if (a.hash === location.hash) revealTarget(); }));
  window.addEventListener('hashchange', revealTarget);
  filter(); revealTarget();
})();
