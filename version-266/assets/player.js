function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

ready(function () {
  var shell = document.querySelector("[data-video-player]");

  if (!shell) {
    return;
  }

  var video = shell.querySelector("video");
  var startButton = shell.querySelector("[data-video-start]");
  var message = shell.querySelector("[data-video-message]");
  var src = shell.getAttribute("data-video-src");
  var hls = null;

  function setMessage(text, hidden) {
    if (!message) {
      return;
    }

    message.textContent = text;
    message.classList.toggle("is-hidden", Boolean(hidden));
  }

  function hideStartButton() {
    if (startButton) {
      startButton.classList.add("is-hidden");
    }
  }

  function attachPlayer() {
    if (!video || !src) {
      setMessage("缺少播放地址", false);
      return;
    }

    if (window.StaticMovieHls && window.StaticMovieHls.isSupported()) {
      hls = new window.StaticMovieHls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.StaticMovieHls.Events.MANIFEST_PARSED, function () {
        setMessage("视频已就绪，点击播放", false);
      });
      hls.on(window.StaticMovieHls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setMessage("视频加载失败，请稍后重试", false);
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      setMessage("视频已就绪，点击播放", false);
    } else {
      setMessage("当前浏览器不支持 HLS 播放", false);
    }
  }

  attachPlayer();

  if (startButton) {
    startButton.addEventListener("click", function () {
      hideStartButton();
      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          setMessage("请再次点击播放器开始播放", false);
        });
      }
    });
  }

  if (video) {
    video.addEventListener("play", function () {
      hideStartButton();
      setMessage("正在播放", true);
    });

    video.addEventListener("pause", function () {
      setMessage("已暂停", false);
    });
  }

  window.addEventListener("beforeunload", function () {
    if (hls) {
      hls.destroy();
    }
  });
});
