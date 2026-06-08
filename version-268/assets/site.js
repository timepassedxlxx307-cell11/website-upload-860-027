(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initMenu() {
    var toggle = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 6200);
  }

  function initSearch() {
    var input = document.getElementById("searchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".searchable-card"));
    var empty = document.querySelector(".empty-state");
    var form = document.querySelector(".search-box");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".filter-chip"));
    if (!input || !cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    var activeChip = "";
    input.value = initial;
    function normalize(value) {
      return String(value || "").trim().toLowerCase();
    }
    function apply() {
      var q = normalize(input.value);
      var matched = 0;
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var chipOk = !activeChip || text.indexOf(normalize(activeChip)) !== -1;
        var queryOk = !q || text.indexOf(q) !== -1;
        var visible = chipOk && queryOk;
        card.style.display = visible ? "" : "none";
        if (visible) {
          matched += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", matched === 0);
      }
    }
    input.addEventListener("input", apply);
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });
        chip.classList.add("is-active");
        activeChip = chip.getAttribute("data-query") || "";
        apply();
      });
    });
    apply();
  }

  function initPlayer() {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector(".player-cover");
    var url = window.streamUrl || "";
    if (!video || !url) {
      return;
    }
    var bound = false;
    function bind() {
      if (bound) {
        return;
      }
      bound = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }
    }
    function start() {
      bind();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    }
    if (cover) {
      cover.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initSearch();
    initPlayer();
  });
})();
