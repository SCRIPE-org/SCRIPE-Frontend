/**
 * Offline fallback page retry & countdown controller.
 * Extracted from inline `<script>` / `onclick` in `offline.html` to enforce strict `script-src 'self'`.
 */
(function () {
  var countdown = 30;
  var intervalId;

  function startAutoRetry() {
    countdown = 30;
    clearInterval(intervalId);
    intervalId = setInterval(function () {
      countdown--;
      var timerEl = document.getElementById("timer");
      if (timerEl) {
        timerEl.textContent = "Auto-retry in " + countdown + "s";
      }
      if (countdown <= 0) {
        retryConnection();
      }
    }, 1000);
  }

  function retryConnection() {
    var btn = document.getElementById("retryBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "⟳ Checking...";
    }
    clearInterval(intervalId);

    fetch("/", { method: "HEAD", cache: "no-store" })
      .then(function () {
        window.location.reload();
      })
      .catch(function () {
        if (btn) {
          btn.disabled = false;
          btn.textContent = "↻ Try Again";
        }
        startAutoRetry();
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("retryBtn");
    if (btn) {
      btn.addEventListener("click", retryConnection);
    }
    startAutoRetry();
  });
})();
