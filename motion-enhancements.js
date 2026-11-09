/* Portfolio motion, built on the locally bundled GSAP and ScrollTrigger. */
(function () {
  'use strict';
  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;
  if (!gsap || !ScrollTrigger || !gsap.matchMedia) return;

  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  const root = document.documentElement;

  media.add('(prefers-reduced-motion: no-preference)', () => {
    const progress = document.querySelector('.reading-progress');
    const bar = progress && progress.firstElementChild;
    const dialog = document.getElementById('project-dialog');
    const listeners = [];
    const listen = (element, name, handler, options) => {
      element.addEventListener(name, handler, options);
      listeners.push(() => element.removeEventListener(name, handler, options));
    };

    // The existing React Bits title and hero image have their own entrances.
    // This sequence adds a small, legible counterpoint around them.
    const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });
    intro.from('.hero-copy .eyebrow', { y: 9, opacity: 0.55 }, 0.02)
      .from('.hero-description', { y: 12, opacity: 0.55 }, 0.19)
      .from('.hero-link, .hero-index', { y: 10, opacity: 0.6, stagger: 0.09 }, 0.32)
      .from('.hero-colophon', { y: 8, opacity: 0.7 }, 0.5);

    if (bar) {
      progress.style.display = 'block';
      gsap.fromTo(bar, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 0.25 }
      });
    }

    // Filtering changes the page height. Animate the numbers, not the cards
    // whose existing reveal and hidden states are owned by app.js.
    document.querySelectorAll('[data-filter]').forEach(button => listen(button, 'click', () => {
      const numbers = Array.from(document.querySelectorAll('.project-card:not([hidden]) .project-number'));
      if (numbers.length) gsap.fromTo(numbers, { x: -8 }, { x: 0, duration: 0.48, stagger: 0.065, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform' });
      requestAnimationFrame(() => ScrollTrigger.refresh());
    }));

    // Intro motion is limited to an already-open dialog and never hides it.
    const animateDialog = () => requestAnimationFrame(() => {
      if (!dialog || !dialog.open) return;
      const introEl = dialog.querySelector('.dialog-intro');
      if (introEl) gsap.fromTo(introEl, { y: 10, opacity: 0.72 }, {
        y: 0, opacity: 1, duration: 0.52, ease: 'power3.out', overwrite: 'auto', clearProps: 'transform,opacity'
      });
    });
    document.querySelectorAll('[data-project-open], #project-prev, #project-next').forEach(el => listen(el, 'click', animateDialog));
    if (dialog) listen(dialog, 'close', () => {
      const introEl = dialog.querySelector('.dialog-intro');
      if (introEl) { gsap.killTweensOf(introEl); gsap.set(introEl, { clearProps: 'transform,opacity' }); }
    });

    return () => {
      listeners.forEach(remove => remove());
      if (progress) progress.style.display = '';
    };
  });

  media.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
    root.classList.add('motion-pointer');
    const removers = [];
    document.querySelectorAll('.hero-product, .project-open').forEach(button => {
      const arrow = button.querySelector('.round-arrow');
      // Preserve the terrarium's carefully cropped 200% image.
      const image = button.matches('.hero-product')
        ? button.querySelector('img')
        : button.querySelector('.project-image:not(.habitat-crop) img');
      const update = () => {
        const active = button.matches(':hover') || button.matches(':focus-visible');
        if (arrow) gsap.to(arrow, { x: active ? 4 : 0, y: active ? -4 : 0, scale: active ? 1.07 : 1, duration: 0.45, ease: 'power3.out', overwrite: 'auto' });
        if (image) gsap.to(image, { scale: active ? 1.035 : 1, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
      };
      ['pointerenter', 'pointerleave', 'focus', 'blur'].forEach(name => {
        button.addEventListener(name, update);
        removers.push(() => button.removeEventListener(name, update));
      });
    });
    return () => { removers.forEach(remove => remove()); root.classList.remove('motion-pointer'); };
  });
})();
