(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  onReady(function () {
    var toggle = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (toggle && mobilePanel) {
      toggle.addEventListener("click", function () {
        var isOpen = mobilePanel.classList.toggle("open");
        toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });
    }

    var filterInput = document.querySelector("[data-filter-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".search-item"));

    function applyFilter(value) {
      var query = String(value || "").trim().toLowerCase();
      cards.forEach(function (card) {
        var text = String(card.getAttribute("data-search") || "").toLowerCase();
        card.classList.toggle("hidden-by-filter", query.length > 0 && text.indexOf(query) === -1);
      });
    }

    if (filterInput && cards.length) {
      var params = new URLSearchParams(window.location.search);
      var initial = params.get("q") || "";
      if (initial) {
        filterInput.value = initial;
      }
      applyFilter(filterInput.value);
      filterInput.addEventListener("input", function () {
        applyFilter(filterInput.value);
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function restartHero() {
      if (timer) {
        window.clearInterval(timer);
      }
      if (slides.length > 1) {
        timer = window.setInterval(function () {
          showSlide(current + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      restartHero();
      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(current - 1);
          restartHero();
        });
      }
      if (next) {
        next.addEventListener("click", function () {
          showSlide(current + 1);
          restartHero();
        });
      }
      dots.forEach(function (dot, index) {
        dot.addEventListener("click", function () {
          showSlide(index);
          restartHero();
        });
      });
    }

    var player = document.querySelector(".player-card");

    if (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".play-overlay");
      var started = false;
      var hlsInstance = null;

      function startPlayback() {
        if (!video || started) {
          return;
        }
        var source = video.getAttribute("data-stream");
        if (!source) {
          return;
        }
        started = true;
        if (overlay) {
          overlay.classList.add("hidden");
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {});
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
          video.play().catch(function () {});
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (!started) {
          startPlayback();
        }
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    }
  });
})();
