(function () {
    var navButton = document.querySelector("[data-nav-toggle]");
    var nav = document.querySelector("[data-site-nav]");

    if (navButton && nav) {
        navButton.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var activeIndex = 0;
        var timer = null;

        var showSlide = function (index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === activeIndex);
            });
        };

        var startTimer = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
        var input = panel.querySelector("[data-search-input]");
        var yearFilter = panel.querySelector("[data-year-filter]");
        var scope = panel.parentElement || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
        var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-button]"));
        var activeCategory = "all";

        var applyFilter = function () {
            var query = input ? input.value.trim().toLowerCase() : "";
            var yearValue = yearFilter ? yearFilter.value : "all";

            cards.forEach(function (card) {
                var title = (card.getAttribute("data-title") || "").toLowerCase();
                var meta = (card.getAttribute("data-meta") || "").toLowerCase();
                var category = card.getAttribute("data-category") || "";
                var year = card.getAttribute("data-year") || "";
                var matchedQuery = !query || title.indexOf(query) !== -1 || meta.indexOf(query) !== -1 || year.indexOf(query) !== -1;
                var matchedCategory = activeCategory === "all" || category === activeCategory;
                var matchedYear = yearValue === "all" || year === yearValue || (yearValue === "older" && Number(year) < 2023);
                card.classList.toggle("is-hidden", !(matchedQuery && matchedCategory && matchedYear));
            });
        };

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilter);
        }

        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                activeCategory = button.getAttribute("data-filter-button") || "all";
                buttons.forEach(function (item) {
                    item.classList.toggle("is-active", item === button);
                });
                applyFilter();
            });
        });
    });
})();
