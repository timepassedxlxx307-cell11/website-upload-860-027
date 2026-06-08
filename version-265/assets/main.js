(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector('.mobile-menu-button');
    var mobileMenu = document.querySelector('.mobile-menu');
    if (menuButton && mobileMenu) {
      menuButton.addEventListener('click', function () {
        var opened = mobileMenu.hasAttribute('hidden');
        if (opened) {
          mobileMenu.removeAttribute('hidden');
          menuButton.setAttribute('aria-expanded', 'true');
          menuButton.textContent = '×';
        } else {
          mobileMenu.setAttribute('hidden', '');
          menuButton.setAttribute('aria-expanded', 'false');
          menuButton.textContent = '☰';
        }
      });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll('.hero-dot'));
      var active = 0;
      var activate = function (index) {
        active = index;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          activate(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          activate((active + 1) % slides.length);
        }, 5200);
      }
    }

    var input = document.querySelector('.movie-search-input');
    var select = document.querySelector('.movie-filter-select');
    var items = Array.prototype.slice.call(document.querySelectorAll('.movie-item'));
    if (items.length && (input || select)) {
      var filter = function () {
        var query = input ? input.value.trim().toLowerCase() : '';
        var type = select ? select.value : '';
        items.forEach(function (item) {
          var haystack = [
            item.dataset.title,
            item.dataset.region,
            item.dataset.year,
            item.dataset.genre,
            item.dataset.type,
            item.dataset.tags
          ].join(' ').toLowerCase();
          var matchesQuery = !query || haystack.indexOf(query) !== -1;
          var matchesType = !type || (item.dataset.type || '').indexOf(type) !== -1 || (item.dataset.tags || '').indexOf(type) !== -1;
          item.classList.toggle('is-hidden', !(matchesQuery && matchesType));
        });
      };
      if (input) {
        input.addEventListener('input', filter);
      }
      if (select) {
        select.addEventListener('change', filter);
      }
    }
  });

  function initMoviePlayer(videoId, buttonId, source) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    if (!video || !button || !source) {
      return;
    }
    var started = false;
    var hlsInstance = null;
    var load = function () {
      if (started) {
        return;
      }
      started = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };
    var play = function () {
      load();
      button.style.display = 'none';
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {
          button.style.display = 'flex';
        });
      }
    };
    button.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
})();
