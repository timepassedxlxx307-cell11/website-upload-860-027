(function () {
    function findAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initMenu() {
        var toggle = document.querySelector('.menu-toggle');
        var mobile = document.querySelector('.mobile-nav');
        if (!toggle || !mobile) {
            return;
        }
        toggle.addEventListener('click', function () {
            mobile.classList.toggle('open');
        });
    }

    function initHero() {
        findAll('[data-hero-slider]').forEach(function (slider) {
            var slides = findAll('.hero-slide', slider);
            var dots = findAll('.hero-dot', slider);
            if (!slides.length) {
                return;
            }
            var index = 0;
            var timer = null;
            function show(next) {
                index = (next + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === index);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === index);
                });
            }
            function start() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5200);
            }
            dots.forEach(function (dot, i) {
                dot.addEventListener('click', function () {
                    show(i);
                    start();
                });
            });
            show(0);
            start();
        });
    }

    function initFilters() {
        findAll('[data-filter-panel]').forEach(function (panel) {
            var grid = document.querySelector(panel.getAttribute('data-target'));
            if (!grid) {
                return;
            }
            var input = panel.querySelector('[data-filter-text]');
            var year = panel.querySelector('[data-filter-year]');
            var region = panel.querySelector('[data-filter-region]');
            var cards = findAll('.movie-card', grid);
            function apply() {
                var q = input ? input.value.trim().toLowerCase() : '';
                var y = year ? year.value : '';
                var r = region ? region.value : '';
                cards.forEach(function (card) {
                    var hay = [
                        card.getAttribute('data-title') || '',
                        card.getAttribute('data-genre') || '',
                        card.getAttribute('data-tags') || '',
                        card.getAttribute('data-region') || '',
                        card.getAttribute('data-year') || ''
                    ].join(' ').toLowerCase();
                    var okText = !q || hay.indexOf(q) !== -1;
                    var okYear = !y || card.getAttribute('data-year') === y;
                    var okRegion = !r || card.getAttribute('data-region') === r;
                    card.classList.toggle('hidden-card', !(okText && okYear && okRegion));
                });
            }
            [input, year, region].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
        });
    }

    window.setupMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('player-overlay');
        if (!video || !source) {
            return;
        }
        var hls = null;
        var prepared = false;
        var requested = false;
        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (requested) {
                        var played = video.play();
                        if (played && played.catch) {
                            played.catch(function () {});
                        }
                    }
                });
            } else {
                video.src = source;
            }
        }
        function play() {
            requested = true;
            prepare();
            if (overlay) {
                overlay.classList.add('hidden');
            }
            var played = video.play();
            if (played && played.catch) {
                played.catch(function () {});
            }
        }
        if (overlay) {
            overlay.addEventListener('click', play);
        }
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('hidden');
            }
        });
        video.addEventListener('click', function () {
            if (!prepared) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
