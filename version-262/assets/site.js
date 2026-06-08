import { H as Hls } from './hls-dru42stk.js';

const ready = (callback) => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
};

ready(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      const open = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.textContent = open ? '×' : '☰';
    });
  }

  document.querySelectorAll('[data-carousel]').forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
    const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
    let current = 0;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, position) => slide.classList.toggle('is-active', position === current));
      dots.forEach((dot, position) => dot.classList.toggle('is-active', position === current));
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => show(index));
    });

    if (slides.length > 1) {
      setInterval(() => show(current + 1), 5200);
    }
  });

  document.querySelectorAll('.search-input').forEach((input) => {
    const area = input.closest('.section-block') || document;
    const cards = Array.from(area.querySelectorAll('.movie-card'));

    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      cards.forEach((card) => {
        const haystack = [
          card.dataset.title,
          card.dataset.tags,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.textContent
        ].join(' ').toLowerCase();
        card.classList.toggle('is-filtered-out', query !== '' && !haystack.includes(query));
      });
    });
  });

  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  const rankingInput = document.querySelector('.full-rank') ? document.querySelector('.search-input') : null;

  if (query && rankingInput) {
    rankingInput.value = query;
    rankingInput.dispatchEvent(new Event('input', { bubbles: true }));
  }

  document.querySelectorAll('.movie-player').forEach((player) => {
    const video = player.querySelector('video');
    const button = player.querySelector('.play-overlay');
    const stream = video ? video.getAttribute('data-stream') : '';
    let hls = null;
    let prepared = false;

    const prepare = () => {
      if (!video || !stream || prepared) {
        return;
      }

      prepared = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return;
      }

      if (Hls && Hls.isSupported()) {
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data && data.fatal) {
            player.classList.add('player-error');
          }
        });
        return;
      }

      player.classList.add('player-error');
    };

    const start = async () => {
      prepare();
      if (!video) {
        return;
      }

      video.controls = true;
      if (button) {
        button.classList.add('is-hidden');
      }

      try {
        await video.play();
      } catch (_error) {
        if (button) {
          button.classList.remove('is-hidden');
        }
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener('play', () => {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    window.addEventListener('beforeunload', () => {
      if (hls) {
        hls.destroy();
      }
    });
  });
});
