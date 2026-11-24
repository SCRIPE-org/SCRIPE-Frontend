/**
 * Synchronous pre-paint theme bootstrap for GlobalError boundary.
 * Served as a static same-origin script (`/theme-noflash.js`) so fatal error
 * pages avoid inline `<script>` tags under strict nonce CSP.
 */
(function () {
  try {
    var explicit = localStorage.getItem("theme");
    var tenantPref = localStorage.getItem("scr_pref_theme");
    var resolved = explicit || tenantPref || "system";
    var isDark =
      resolved === "dark" ||
      (resolved === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // Ignore storage/matchMedia failures in restricted contexts
  }
})();
