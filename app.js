'use strict';
const projects = portfolioProjects;
const filters = [...document.querySelectorAll('[data-filter]')];
const cards = [...document.querySelectorAll('.project-card')];
const projectList = document.querySelector('.project-list');
filters.forEach(button => button.addEventListener('click', () => {
  const selected = button.dataset.filter;
  let count = 0;
  filters.forEach(filter => {
    const active = filter === button;
    filter.classList.toggle('active', active);
    filter.setAttribute('aria-pressed', String(active));
  });
  cards.forEach(card => {
    card.hidden = selected !== 'all' && card.dataset.category !== selected;
    if (!card.hidden) count++;
  });
  projectList.classList.toggle('filtered', selected !== 'all');
  document.getElementById('filter-status').textContent = `展示${selected === 'all' ? '全部' : button.textContent.trim()} ${count} 件作品`;
}));

const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobile-nav');
function closeMenu() {
  mobileNav.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '打开导航菜单');
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '关闭导航菜单' : '打开导航菜单');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!mobileNav.hidden && !event.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const projectDialog = document.getElementById('project-dialog');
let currentProject = 0;
let returnFocus = null;
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
function fill(containerId, items, render) {
  document.getElementById(containerId).replaceChildren(...items.map(render));
}
function renderProject(index) {
  currentProject = (index + projects.length) % projects.length;
  const project = projects[currentProject];
  document.getElementById('dialog-counter').textContent = `PROJECT ${String(currentProject + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  document.getElementById('dialog-category').textContent = project.category;
  document.getElementById('dialog-title').textContent = project.title;
  document.getElementById('dialog-summary').textContent = project.summary;
  document.getElementById('case-role').textContent = project.role || '';
  projectDialog.dataset.project = project.id;
  const hero = document.getElementById('dialog-image');
  hero.src = project.hero;
  hero.alt = project.alt;
  fill('case-meta', project.meta, item => {
    const node = element('div'); node.append(element('span', item.label), element('strong', item.value)); return node;
  });
  fill('case-story', project.story, item => {
    const node = element('div'); node.append(element('h3', item.title), element('p', item.text)); return node;
  });
  fill('case-features', project.features, (item, i) => {
    const node = element('div'); node.append(element('span', `0${i + 1}`, 'feature-number'), element('h3', item.title), element('p', item.text)); return node;
  });
  fill('case-gallery', project.gallery, item => {
    const figure = element('figure');
    const image = element('img'); image.src = item.src; image.alt = item.alt; image.loading = 'lazy';
    const caption = element('figcaption', item.caption);
    figure.append(image, caption); return figure;
  });
  document.getElementById('validation-completed').textContent = project.validation.completed;
  document.getElementById('validation-pending').textContent = project.validation.pending;
  document.getElementById('validation-limit').textContent = project.validation.limit;
  document.getElementById('case-validation').open = false;
  document.getElementById('case-context').textContent = project.context || '';
  fill('case-downloads', project.downloads, item => {
    const link = element('a', item.label + ' ↓', 'solid-button');
    link.href = item.src; link.setAttribute('download', ''); return link;
  });
  projectDialog.scrollTop = 0;
}
document.querySelectorAll('[data-project-open]').forEach(button => button.addEventListener('click', () => {
  returnFocus = button;
  renderProject(projects.findIndex(project => project.id === button.dataset.projectOpen));
  projectDialog.showModal();
  document.body.classList.add('modal-open');
  projectDialog.scrollTop = 0;
  projectDialog.querySelector('[data-dialog-close]').focus({ preventScroll: true });
}));
function navigateProject(direction) {
  renderProject(currentProject + direction);
  document.getElementById('dialog-title').focus({ preventScroll: true });
}
document.getElementById('project-prev').addEventListener('click', () => navigateProject(-1));
document.getElementById('project-next').addEventListener('click', () => navigateProject(1));
projectDialog.querySelector('[data-dialog-close]').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', event => {
  if (event.target !== projectDialog) return;
  const box = projectDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) projectDialog.close();
});
projectDialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
});
document.getElementById('copy-link').addEventListener('click', async () => {
  const url = window.location.origin + window.location.pathname;
  try {
    await navigator.clipboard.writeText(url);
    document.getElementById('copy-status').textContent = '作品集链接已复制。';
  } catch {
    const fallback = document.getElementById('copy-fallback');
    fallback.hidden = false;
    fallback.querySelector('input').value = url;
    fallback.querySelector('input').focus();
    fallback.querySelector('input').select();
    document.getElementById('copy-status').textContent = '请选中下方链接进行复制。';
  }
});
if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      document.querySelectorAll('[data-nav]').forEach(link => {
        const active = link.dataset.nav === entry.target.id;
        link.classList.toggle('current', active);
        if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-15% 0px -60% 0px', threshold: 0 });
  document.querySelectorAll('#top, #work, #profile, #about, #resources').forEach(section => sectionObserver.observe(section));
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible'); revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    document.querySelectorAll('.section-heading, .project-card, .method-list article').forEach(item => {
      item.classList.add('reveal'); revealObserver.observe(item);
    });
  }
}
