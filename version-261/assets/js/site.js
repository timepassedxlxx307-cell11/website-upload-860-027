(function () {
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');

  if (menuButton && menu) {
    menuButton.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  const queryParams = new URLSearchParams(window.location.search);
  const initialQuery = queryParams.get('q') || '';

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    const input = scope.querySelector('[data-filter-input]');
    const cards = Array.from(scope.querySelectorAll('[data-movie-card]'));
    const chips = Array.from(scope.querySelectorAll('[data-filter-chip]'));
    let chipValue = '';

    function normalize(value) {
      return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilter() {
      const textValue = normalize(input ? input.value : '');
      const chipText = normalize(chipValue);

      cards.forEach(function (card) {
        const haystack = normalize(card.getAttribute('data-search'));
        const matchedText = !textValue || haystack.indexOf(textValue) !== -1;
        const matchedChip = !chipText || haystack.indexOf(chipText) !== -1;
        card.classList.toggle('is-hidden', !(matchedText && matchedChip));
      });
    }

    if (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }

      input.addEventListener('input', applyFilter);
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipValue = chip.getAttribute('data-filter-value') || '';
        chips.forEach(function (item) {
          item.classList.toggle('active', item === chip);
        });
        applyFilter();
      });
    });

    applyFilter();
  });
})();
