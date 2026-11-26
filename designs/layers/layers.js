const study = document.querySelector('.ly-study');
const stages = [...study.querySelectorAll('[data-stage]')];
const plates = [...study.querySelectorAll('[data-plate]')];
const stageLinks = [...study.querySelectorAll('.ly-choices a')];
const menu = document.querySelector('.ly-index');
const motion = matchMedia('(prefers-reduced-motion: no-preference)');
const wide = matchMedia('(min-width: 761px)');
const clamp = value => Math.max(0, Math.min(1, value));
let frame = 0;
let watching = false;

function refresh() {
  frame = 0;
  const viewport = document.documentElement.clientHeight;
  let activeIndex = 0;
  const bounds = stages.map(stage => stage.getBoundingClientRect());
  for (let i = 0; i < stages.length; i++) {
    const top = bounds[i].top;
    if (wide.matches) {
      // Reveal the next physical surface as its explanation crosses the reading line.
      const progress = i === 0 ? 1 : clamp((viewport * .75 - top) / (viewport * .44));
      plates[i].style.clipPath = `inset(0 ${((1 - progress) * 100).toFixed(2)}% 0 0)`;
      if (progress >= .5) activeIndex = i;
    } else {
      const progress = clamp((viewport - top) / Math.min(viewport * .36, bounds[i].height * .6));
      stages[i].style.setProperty('--slice', ((1 - progress) * 24).toFixed(2) + '%');
    }
  }
  stageLinks.forEach((link, i) => {
    if (i === activeIndex) link.setAttribute('aria-current', 'step');
    else link.removeAttribute('aria-current');
  });
}

function requestFrame() {
  if (!frame) frame = requestAnimationFrame(refresh);
}

function syncMotion() {
  document.documentElement.classList.toggle('ly-moving', motion.matches);
  if (motion.matches && !watching) {
    window.addEventListener('scroll', requestFrame, {passive:true});
    window.addEventListener('resize', requestFrame);
    watching = true;
  } else if (!motion.matches && watching) {
    window.removeEventListener('scroll', requestFrame);
    window.removeEventListener('resize', requestFrame);
    cancelAnimationFrame(frame);
    frame = 0;
    watching = false;
    plates.forEach(plate => plate.style.removeProperty('clip-path'));
    stages.forEach(stage => stage.style.removeProperty('--slice'));
  }
  if (watching) requestFrame();
}

motion.addEventListener('change', syncMotion);
wide.addEventListener('change', syncMotion);
syncMotion();

menu.querySelector('nav').addEventListener('click', event => {
  const link = event.target.closest('a');
  if (!link) return;
  menu.open = false;
  const section = document.getElementById(link.hash.slice(1));
  section.setAttribute('tabindex','-1');
  section.focus({preventScroll:true});
});
menu.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
