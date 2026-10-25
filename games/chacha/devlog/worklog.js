/* GIF originals stay untouched. A still frame makes pause and reduced motion usable. */
'use strict';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const players = [];
for (const figure of document.querySelectorAll('[data-play-sample]')) {
  const img = figure.querySelector('img');
  const button = figure.querySelector('.motionToggle');
  const player = { img, button, playing: false };
  function setPlaying(playing) {
    player.playing = playing;
    img.src = playing ? img.dataset.animation : img.dataset.still;
    button.textContent = playing ? '움직임 멈추기' : 'GIF 재생하기';
    button.setAttribute('aria-label', `${img.alt} — ${button.textContent}`);
  }
  player.setPlaying = setPlaying;
  setPlaying(!reducedMotion.matches);
  button.hidden = false;
  button.addEventListener('click', () => setPlaying(!player.playing));
  players.push(player);
}
reducedMotion.addEventListener('change', event => {
  if (event.matches) for (const player of players) player.setPlaying(false);
});
