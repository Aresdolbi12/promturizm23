(() => {
  const program = document.querySelector('.program');
  const lines = Array.from(document.querySelectorAll('[data-route-ink]'));
  const stops = Array.from(document.querySelectorAll('[data-stop]'));
  const marker = document.querySelector('.map-position');
  if (!program || !marker || lines.length + 1 !== stops.length) return;

  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const replay = document.querySelector('.replay');
  const drawing = document.querySelector('.works-drawing');
  replay.addEventListener('click', () => {
    if (motionPreference.matches) return;
    for (const animation of drawing.getAnimations({ subtree: true })) {
      animation.currentTime = 0;
      animation.play();
    }
  });
  const lineLengths = lines.map(line => line.getTotalLength());
  const clamp = value => Math.max(0, Math.min(1, value));
  let scheduled = false;

  function paint() {
    scheduled = false;
    if (motionPreference.matches) return;
    const readingLine = window.innerHeight * .58;
    const positions = stops.map(stop => stop.getBoundingClientRect());
    let segmentIndex = 0;
    let segmentFraction = 0;
    lines.forEach((line, i) => {
      const distance = positions[i + 1].top - positions[i].top;
      const fraction = clamp((readingLine - positions[i].top) / Math.max(1, distance));
      line.style.strokeDashoffset = String(1 - fraction);
      if (fraction > 0) {
        segmentIndex = i;
        segmentFraction = fraction;
      }
    });
    const point = lines[segmentIndex].getPointAtLength(lineLengths[segmentIndex] * segmentFraction);
    marker.setAttribute('cx', point.x);
    marker.setAttribute('cy', point.y);
    stops.forEach((stop, i) => {
      const progress = clamp((readingLine - positions[i].top) / positions[i].height);
      stop.style.setProperty('--stop-progress', progress.toFixed(4));
    });
  }

  function schedulePaint() {
    if (scheduled || motionPreference.matches) return;
    scheduled = true;
    requestAnimationFrame(paint);
  }

  function setMotion() {
    const enabled = !motionPreference.matches;
    replay.hidden = !enabled || typeof drawing.getAnimations !== 'function';
    document.documentElement.classList.toggle('draw-on', enabled);
    program.classList.toggle('route-on', enabled);
    if (enabled) {
      paint();
    } else {
      lines.forEach(line => line.style.removeProperty('stroke-dashoffset'));
      stops.forEach(stop => stop.style.removeProperty('--stop-progress'));
    }
  }

  setMotion();
  motionPreference.addEventListener('change', setMotion);
  window.addEventListener('scroll', schedulePaint, { passive: true });
  window.addEventListener('resize', schedulePaint);
  window.addEventListener('pageshow', schedulePaint);
  document.fonts?.ready.then(schedulePaint);
})();
