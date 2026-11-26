const links = [...document.querySelectorAll('[data-atlas-select]')];
const index = document.querySelector('[data-selected-index]');
const name = document.querySelector('[data-selected-name]');
const more = document.querySelector('[data-selected-link]');

function select(id) {
  const place = document.getElementById('place-' + id);
  if (!place) return;
  for (const link of links) {
    if (link.dataset.atlasSelect === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  index.textContent = place.querySelector('.index').textContent;
  name.textContent = place.querySelector('h3').textContent;
  more.setAttribute('href', '#' + place.id);
}

for (const link of links) {
  link.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    select(link.dataset.atlasSelect);
  });
}
select('station');
