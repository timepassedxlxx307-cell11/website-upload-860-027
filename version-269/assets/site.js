/*
  国产好剧 - 纯静态交互脚本
  功能：移动端导航、Hero 轮播、页面内筛选、随机跳转、HLS 播放器、全站搜索。
*/

(function () {
  'use strict';

  var HLS_CDN = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
  var hlsLoadingPromise = null;

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(text) {
    return String(text || '').toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

    if (slides.length <= 1) {
      return;
    }

    var index = 0;

    function showSlide(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(index + 1);
    }, 5200);
  }

  function setupPageFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    panels.forEach(function (panel) {
      var root = panel.closest('section') || document;
      var input = panel.querySelector('[data-page-filter-input]');
      var region = panel.querySelector('[data-filter-region]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var count = panel.querySelector('[data-filter-count]');
      var cards = Array.prototype.slice.call(root.querySelectorAll('[data-movie-card]'));

      function matchesYear(cardYear, selectedYear) {
        if (!selectedYear) {
          return true;
        }

        if (selectedYear === '2022') {
          var numericYear = parseInt(cardYear, 10);
          return !Number.isFinite(numericYear) || numericYear <= 2022;
        }

        return cardYear.indexOf(selectedYear) !== -1;
      }

      function applyFilter() {
        var query = normalize(input && input.value);
        var regionValue = normalize(region && region.value);
        var typeValue = normalize(type && type.value);
        var yearValue = normalize(year && year.value);
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = normalize(card.getAttribute('data-search'));
          var cardRegion = normalize(card.getAttribute('data-region'));
          var cardType = normalize(card.getAttribute('data-type'));
          var cardYear = normalize(card.getAttribute('data-year'));
          var ok = true;

          if (query && searchText.indexOf(query) === -1) {
            ok = false;
          }

          if (regionValue && cardRegion.indexOf(regionValue) === -1) {
            ok = false;
          }

          if (typeValue && cardType.indexOf(typeValue) === -1) {
            ok = false;
          }

          if (!matchesYear(cardYear, yearValue)) {
            ok = false;
          }

          card.hidden = !ok;

          if (ok) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = '当前显示 ' + visible + ' / ' + cards.length + ' 部影片';
        }
      }

      [input, region, type, year].forEach(function (element) {
        if (!element) {
          return;
        }

        element.addEventListener('input', applyFilter);
        element.addEventListener('change', applyFilter);
      });

      applyFilter();
    });
  }

  function setupRandomMovie() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('[data-random-movie]'));

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var total = parseInt(button.getAttribute('data-total') || '1', 10);
        var id = Math.floor(Math.random() * total) + 1;
        window.location.href = 'movie-' + id + '.html';
      });
    });
  }

  function loadHlsScript() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    if (hlsLoadingPromise) {
      return hlsLoadingPromise;
    }

    hlsLoadingPromise = new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = HLS_CDN;
      script.async = true;
      script.onload = function () {
        resolve(window.Hls);
      };
      script.onerror = function () {
        reject(new Error('HLS 播放库加载失败'));
      };
      document.head.appendChild(script);
    });

    return hlsLoadingPromise;
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

    shells.forEach(function (shell) {
      var button = shell.querySelector('[data-play-button]');
      var video = shell.querySelector('[data-video-player]');
      var message = shell.querySelector('[data-player-message]');
      var source = shell.getAttribute('data-m3u8');
      var playerStarted = false;

      if (!button || !video || !source) {
        return;
      }

      function setMessage(text) {
        if (message) {
          message.textContent = text || '';
        }
      }

      function startPlayback() {
        if (playerStarted) {
          video.play();
          return;
        }

        playerStarted = true;
        button.classList.add('is-hidden');
        setMessage('正在初始化高清播放线路...');

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', function () {
            setMessage('');
            video.play().catch(function () {
              setMessage('请再次点击视频区域开始播放。');
            });
          }, { once: true });
          return;
        }

        loadHlsScript()
          .then(function (Hls) {
            if (!Hls || !Hls.isSupported()) {
              throw new Error('当前浏览器不支持 HLS 播放');
            }

            var hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function () {
              setMessage('');
              video.play().catch(function () {
                setMessage('请再次点击视频区域开始播放。');
              });
            });
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setMessage('播放线路暂时无法连接，请刷新页面或稍后再试。');
                hls.destroy();
              }
            });
          })
          .catch(function (error) {
            setMessage(error.message || '播放初始化失败，请更换浏览器访问。');
          });
      }

      button.addEventListener('click', startPlayback);
      video.addEventListener('click', function () {
        if (!playerStarted) {
          startPlayback();
        }
      });
    });
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="poster-link" href="' + movie.detail + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
      '    <span class="poster-glow"></span>',
      '    <img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <span class="play-badge">播放</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta">' + escapeHtml(movie.region + ' · ' + movie.type + ' · ' + movie.year + ' · ' + movie.genre) + '</div>',
      '    <h3><a href="' + movie.detail + '">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + movie.tags.slice(0, 3).map(function (tag) {
      movie.tags.slice(0, 3).map(function (tag) {
        return '<span>' + escapeHtml(tag) + '</span>';
      }).join('') + '</div>',
      '  </div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function setupGlobalSearch() {
    var form = document.querySelector('[data-global-search-form]');
    var input = document.querySelector('[data-global-search-input]');
    var results = document.querySelector('[data-global-search-results]');
    var status = document.querySelector('[data-global-search-status]');
    var index = window.MOVIE_SEARCH_INDEX || [];

    if (!form || !input || !results || !status || !index.length) {
      return;
    }

    var parameters = new URLSearchParams(window.location.search);
    var initialQuery = parameters.get('q') || '';

    function render(query) {
      var normalizedQuery = normalize(query);
      var matched = normalizedQuery
        ? index.filter(function (movie) {
            return normalize(movie.searchText).indexOf(normalizedQuery) !== -1;
          })
        : index.slice(0, 24);

      results.innerHTML = matched.slice(0, 120).map(movieCardTemplate).join('');

      if (normalizedQuery) {
        status.textContent = '关键词“' + query + '”共找到 ' + matched.length + ' 部影片，当前显示前 ' + Math.min(matched.length, 120) + ' 部。';
      } else {
        status.textContent = '可直接输入关键词搜索；未输入时显示前 24 部推荐影片。';
      }
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      render(input.value);
    });

    input.addEventListener('input', function () {
      render(input.value);
    });

    input.value = initialQuery;
    render(initialQuery);
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupPageFilter();
    setupRandomMovie();
    setupPlayers();
    setupGlobalSearch();
  });
})();
