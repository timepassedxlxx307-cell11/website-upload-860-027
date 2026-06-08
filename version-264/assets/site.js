(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-nav-links]');

        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                nav.classList.toggle('is-open');
            });
        }

        bindSearch();
        bindHero();
        bindCards();
        bindPlayer();
    });

    function normalize(value) {
        return String(value || '').trim().toLowerCase();
    }

    function bindSearch() {
        var inputs = document.querySelectorAll('[data-site-search]');
        var movies = window.SITE_MOVIES || [];

        inputs.forEach(function (input) {
            var wrap = input.closest('[data-search-wrap]') || input.parentElement;
            var panel = wrap ? wrap.querySelector('[data-search-panel]') : null;

            if (!panel) {
                return;
            }

            input.addEventListener('input', function () {
                var keyword = normalize(input.value);

                if (!keyword) {
                    panel.classList.remove('is-open');
                    panel.innerHTML = '';
                    return;
                }

                var results = movies.filter(function (item) {
                    return normalize(item.title + ' ' + item.year + ' ' + item.genre + ' ' + item.category).indexOf(keyword) !== -1;
                }).slice(0, 10);

                if (!results.length) {
                    panel.innerHTML = '<a href="./movies.html"><strong>查看全部影片</strong><span>换个关键词继续发现</span></a>';
                    panel.classList.add('is-open');
                    return;
                }

                panel.innerHTML = results.map(function (item) {
                    return '<a href="' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.genre) + '</span></a>';
                }).join('');
                panel.classList.add('is-open');
            });

            document.addEventListener('click', function (event) {
                if (wrap && !wrap.contains(event.target)) {
                    panel.classList.remove('is-open');
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function bindHero() {
        var hero = document.querySelector('[data-hero]');

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function bindCards() {
        var filter = document.querySelector('[data-card-filter]');
        var sort = document.querySelector('[data-card-sort]');
        var grid = document.querySelector('[data-card-grid]');

        if (!grid) {
            return;
        }

        function update() {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card-item]'));
            var keyword = normalize(filter ? filter.value : '');
            var sortValue = sort ? sort.value : 'default';

            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-genre') + ' ' + card.getAttribute('data-region'));
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });

            if (sortValue !== 'default') {
                cards.sort(function (a, b) {
                    if (sortValue === 'year') {
                        return Number(b.getAttribute('data-year-number')) - Number(a.getAttribute('data-year-number'));
                    }
                    return String(a.getAttribute('data-title')).localeCompare(String(b.getAttribute('data-title')), 'zh-CN');
                }).forEach(function (card) {
                    grid.appendChild(card);
                });
            }
        }

        if (filter) {
            filter.addEventListener('input', update);
        }

        if (sort) {
            sort.addEventListener('change', update);
        }
    }

    function bindPlayer() {
        var player = document.querySelector('[data-player]');

        if (!player) {
            return;
        }

        var video = player.querySelector('video');
        var cover = player.querySelector('[data-player-cover]');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-src');
        var initialized = false;
        var hls = null;

        if (!video || !source) {
            return;
        }

        function init() {
            if (initialized) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            initialized = true;
        }

        function play() {
            init();

            if (cover) {
                cover.classList.add('is-hidden');
            }

            video.controls = true;
            var promise = video.play();

            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    if (cover) {
                        cover.classList.remove('is-hidden');
                    }
                });
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        if (cover) {
            cover.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }
})();
