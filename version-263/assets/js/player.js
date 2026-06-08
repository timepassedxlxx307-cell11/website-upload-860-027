import { H as Hls } from "./hls.js";

export function createMoviePlayer(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var sourceUrl = config.url;
    var hlsInstance = null;
    var attached = false;

    if (!video || !button || !sourceUrl) {
        return;
    }

    var attachSource = function () {
        if (attached) {
            return;
        }

        attached = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = sourceUrl;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(sourceUrl);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = sourceUrl;
    };

    var play = function () {
        attachSource();
        button.hidden = true;
        video.setAttribute("controls", "controls");

        var promise = video.play();

        if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
                button.hidden = false;
            });
        }
    };

    button.addEventListener("click", play);

    video.addEventListener("click", function () {
        if (video.paused) {
            play();
        }
    });

    video.addEventListener("play", function () {
        button.hidden = true;
    });

    video.addEventListener("pause", function () {
        if (!video.ended) {
            button.hidden = false;
        }
    });

    video.addEventListener("ended", function () {
        button.hidden = false;
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
