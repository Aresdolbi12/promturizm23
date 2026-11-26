// Navigation for the Codrops Demo 4 spread. Its original BookBlock instance
// performs the page construction, 3D turn and instant fallback.
(() => {
  const $ = window.jQuery;
  if (!$ || !$.fn.bookblock) return;
  const book = document.getElementById('bb-bookblock');
  const wrapper = book.closest('.bb-custom-wrapper');
  const spreads = [...book.children];
  const prev = document.getElementById('bb-nav-prev');
  const next = document.getElementById('bb-nav-next');
  const count = document.getElementById('leaf-count');
  const label = document.getElementById('leaf-label');
  const byHash = new Map([['#reader', 0]]);
  spreads.forEach((spread, index) => {
    for (const heading of spread.querySelectorAll('[id]')) byHash.set('#' + heading.id, index);
  });
  let current = byHash.get(location.hash) ?? 0;
  let turning = false;
  let queued;

  function showStatus(index) {
    const changed = index !== current;
    current = index;
    turning = false;
    wrapper.dataset.cover = String(index === 0);
    prev.setAttribute('aria-disabled', String(index === 0));
    next.setAttribute('aria-disabled', String(index === spreads.length - 1));
    next.querySelector('span').textContent = index === 0 ? 'Раскрыть программу' : 'Дальше';
    count.textContent = (index + 1) + ' / ' + spreads.length;
    label.textContent = spreads[index].dataset.label;
    if (changed && window.matchMedia('(max-width:760px)').matches && book.getBoundingClientRect().top < -12) {
      book.scrollIntoView({block:'start'});
      book.focus({preventScroll:true});
    }
    if (queued !== undefined) {
      const target = queued;
      queued = undefined;
      navigate(target);
    }
  }
  function navigate(index) {
    if (index < 0 || index >= spreads.length) return;
    if (turning) { queued = index; return; }
    if (current !== index) $(book).bookblock('jump', index + 1);
  }
  function follow(hash) {
    if (!byHash.has(hash)) return;
    navigate(byHash.get(hash));
    document.getElementById('reader').scrollIntoView({block:'start'});
    book.focus({preventScroll:true});
  }
  document.documentElement.classList.replace('no-js', 'reader-on');
  try {
    $(book).bookblock({
      startPage: current + 1,
      speed: 630,
      shadowSides: .44,
      shadowFlip: .28,
      onBeforeFlip() { turning = true; wrapper.dataset.cover = 'false'; },
      onEndFlip(_old, index) { showStatus(index); },
    });
  } catch {
    document.documentElement.classList.replace('reader-on', 'no-js');
    spreads.forEach(spread => spread.removeAttribute('style'));
    return;
  }
  showStatus(current);
  prev.addEventListener('click', () => navigate(current - 1));
  next.addEventListener('click', () => navigate(current + 1));
  wrapper.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const targets = {ArrowLeft:current-1, ArrowRight:current+1, Home:0, End:spreads.length-1};
    if (!Object.hasOwn(targets,event.key)) return;
    event.preventDefault();
    navigate(targets[event.key]);
  });
  document.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || !byHash.has(anchor.hash)) return;
    event.preventDefault();
    if (location.hash !== anchor.hash) history.pushState(null, '', anchor.hash);
    follow(anchor.hash);
  });
  window.addEventListener('hashchange', () => follow(location.hash));
})();
