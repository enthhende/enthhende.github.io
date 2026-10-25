(() => {
  'use strict';
  const boxes = [...document.querySelectorAll('[data-heart]')];
  const key = 'chacha-hearts-v1';
  let persistent = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) boxes.forEach(box => { box.checked = saved.includes(box.dataset.heart); });
  } catch { persistent = false; }
  function update(save) {
    const checked = boxes.filter(box => box.checked);
    document.getElementById('heart-count').textContent = `${checked.length} / 20`;
    document.getElementById('heart-progress').value = checked.length;
    if (save && persistent) {
      try { localStorage.setItem(key, JSON.stringify(checked.map(box => box.dataset.heart))); }
      catch { persistent = false; }
    }
    document.getElementById('heart-storage').textContent = persistent
      ? '체크는 이 브라우저에 보관돼요. 게임 저장과는 별개예요.'
      : '지금은 체크를 이 화면에서만 사용할 수 있어요.';
  }
  boxes.forEach(box => box.addEventListener('change', () => update(true)));
  document.getElementById('heart-reset').addEventListener('click', () => {
    if (!window.confirm('하트 수집 체크를 모두 지울까요?')) return;
    boxes.forEach(box => { box.checked = false; });
    update(true);
  });
  update(false);
})();
