function initHighlightBrush() {
  const elements = document.querySelectorAll<HTMLElement>('.hl-brush');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  elements.forEach((el) => observer.observe(el));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHighlightBrush);
} else {
  initHighlightBrush();
}

document.addEventListener('astro:page-load', initHighlightBrush);
