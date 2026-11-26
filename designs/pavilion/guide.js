// Active scene in the horizontal exhibition or its vertical mobile layout.
const panels = [...document.querySelectorAll('#wrapper > section')];
const stops = [...document.querySelectorAll('.pav-dock a')];
const vertical = window.matchMedia('(max-width: 736px), (max-height: 620px), (pointer: coarse)');
let queued = false;

function update() {
  queued = false;
  const midpoint = vertical.matches ? innerHeight / 2 : innerWidth / 2;
  const current = panels.find(panel => {
    const bounds = panel.getBoundingClientRect();
    return vertical.matches ? bounds.top <= midpoint && bounds.bottom > midpoint :
      bounds.left <= midpoint && bounds.right > midpoint;
  });
  if (!current) return;
  for (const link of stops) {
    if (link.hash === '#' + current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
  document.body.classList.toggle('pav-last', current === panels.at(-1));
}

function scheduleUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(update);
}
addEventListener('scroll', scheduleUpdate, { passive: true });
addEventListener('resize', scheduleUpdate);
update();
