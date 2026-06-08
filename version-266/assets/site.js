(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-menu-panel]");

    if (!button || !panel) {
      return;
    }

    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero]");

    if (!root) {
      return;
    }

    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    start();
  }

  function initImageFallbacks() {
    document.querySelectorAll("img").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("image-error");
      });
    });
  }

  function initStaticFilters() {
    var root = document.querySelector("[data-filter-root]");

    if (!root) {
      return;
    }

    var keyword = root.querySelector("[data-filter-keyword]");
    var channel = root.querySelector("[data-filter-channel]");
    var type = root.querySelector("[data-filter-type]");
    var year = root.querySelector("[data-filter-year]");
    var count = root.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));

    function apply() {
      var query = normalize(keyword && keyword.value);
      var channelValue = normalize(channel && channel.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.textContent + " " + card.getAttribute("data-title"));
        var matches = true;

        if (query && text.indexOf(query) === -1) {
          matches = false;
        }
        if (channelValue && normalize(card.getAttribute("data-channel")) !== channelValue) {
          matches = false;
        }
        if (typeValue && normalize(card.getAttribute("data-type")) !== typeValue) {
          matches = false;
        }
        if (yearValue && normalize(card.getAttribute("data-year")) !== yearValue) {
          matches = false;
        }

        card.classList.toggle("is-hidden", !matches);
        if (matches) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    [keyword, channel, type, year].forEach(function (input) {
      if (input) {
        input.addEventListener("input", apply);
        input.addEventListener("change", apply);
      }
    });
  }

  function getRelativePrefix() {
    var path = window.location.pathname;
    return path.indexOf("/video/") !== -1 || path.indexOf("/category/") !== -1 ? "../" : "";
  }

  function createResultCard(movie, prefix) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");

    return '' +
      '<article class="movie-card" data-movie-card>' +
        '<a href="' + prefix + 'video/' + movie.id + '.html" class="poster-link" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<div class="poster-frame" data-title="' + escapeHtml(movie.title) + '">' +
            '<img src="' + prefix + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">' +
            '<span class="play-hover" aria-hidden="true">▶</span>' +
          '</div>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="' + prefix + 'video/' + movie.id + '.html">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="card-meta">' + escapeHtml(movie.year + ' / ' + movie.region_group + ' / ' + movie.type_group_name) + '</p>' +
          '<p class="card-desc">' + escapeHtml(movie.one_line) + '</p>' +
          '<div class="card-tags">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      }[char];
    });
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");

    if (!root || !window.MOVIES) {
      return;
    }

    var input = root.querySelector("[data-search-input]");
    var channel = root.querySelector("[data-search-channel]");
    var type = root.querySelector("[data-search-type]");
    var results = root.querySelector("[data-search-results]");
    var count = root.querySelector("[data-search-count]");
    var params = new URLSearchParams(window.location.search);
    var prefix = getRelativePrefix();

    if (input && params.get("q")) {
      input.value = params.get("q");
    }

    function apply() {
      var query = normalize(input && input.value);
      var channelValue = normalize(channel && channel.value);
      var typeValue = normalize(type && type.value);
      var matches = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.region_group,
          movie.type,
          movie.type_group_name,
          movie.year,
          movie.genre,
          movie.one_line,
          movie.summary,
          (movie.tags || []).join(" ")
        ].join(" "));

        if (query && haystack.indexOf(query) === -1) {
          return false;
        }
        if (channelValue && normalize(movie.channel_slug) !== channelValue) {
          return false;
        }
        if (typeValue && normalize(movie.type_group) !== typeValue) {
          return false;
        }
        return true;
      }).slice(0, 160);

      if (results) {
        results.innerHTML = matches.map(function (movie) {
          return createResultCard(movie, prefix);
        }).join("");
      }

      if (count) {
        count.textContent = String(matches.length);
      }

      initImageFallbacks();
    }

    [input, channel, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    initMenu();
    initHero();
    initImageFallbacks();
    initStaticFilters();
    initSearchPage();
  });
})();
