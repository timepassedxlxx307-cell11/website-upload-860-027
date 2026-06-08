(function () {
    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    function card(movie) {
        return '<a class="movie-card" href="' + escapeHtml(movie.url) + '" data-title="' + escapeHtml(movie.title) + '" data-year="' + escapeHtml(movie.year) + '" data-region="' + escapeHtml(movie.region) + '" data-genre="' + escapeHtml(movie.genre) + '" data-tags="' + escapeHtml(movie.tags) + '">' +
            '<span class="poster-wrap"><img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy"><span class="poster-shade"></span><span class="badge-row"><em>' + escapeHtml(movie.region) + '</em><em>' + escapeHtml(movie.type) + '</em></span><span class="play-badge">▶</span></span>' +
            '<span class="movie-info"><strong>' + escapeHtml(movie.title) + '</strong><span class="movie-desc">' + escapeHtml(movie.desc) + '</span><span class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.genre) + '</span></span></span>' +
            '</a>';
    }

    function unique(values) {
        var seen = {};
        return values.filter(function (value) {
            if (!value || seen[value]) {
                return false;
            }
            seen[value] = true;
            return true;
        });
    }

    var data = window.SITE_MOVIES || [];
    var form = document.getElementById('search-form');
    var input = document.getElementById('search-input');
    var region = document.getElementById('search-region');
    var year = document.getElementById('search-year');
    var results = document.getElementById('search-results');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    function fillSelect(select, values, label) {
        if (!select) {
            return;
        }
        select.innerHTML = '<option value="">' + label + '</option>' + values.map(function (value) {
            return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
        }).join('');
    }

    function render() {
        if (!results) {
            return;
        }
        var q = input ? input.value.trim().toLowerCase() : '';
        var r = region ? region.value : '';
        var y = year ? year.value : '';
        var matches = data.filter(function (movie) {
            var hay = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.desc].join(' ').toLowerCase();
            return (!q || hay.indexOf(q) !== -1) && (!r || movie.region === r) && (!y || movie.year === y);
        }).slice(0, 240);
        if (!matches.length) {
            results.innerHTML = '<div class="empty-result">没有找到相关影片，可更换关键词继续搜索。</div>';
            return;
        }
        results.innerHTML = matches.map(card).join('');
    }

    fillSelect(region, unique(data.map(function (movie) { return movie.region; })).sort(), '全部地区');
    fillSelect(year, unique(data.map(function (movie) { return movie.year; })).sort().reverse(), '全部年份');

    if (input) {
        input.value = query;
        input.addEventListener('input', render);
    }
    if (region) {
        region.addEventListener('change', render);
    }
    if (year) {
        year.addEventListener('change', render);
    }
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render();
        });
    }
    render();
})();
