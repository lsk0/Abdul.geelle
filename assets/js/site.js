/* Shared behaviour: Somali / English switch, mobile menu, footer year. */
(function () {
  "use strict";
  var KEY = "ag-language";
  var lang = "en";
  try { if (localStorage.getItem(KEY) === "so") lang = "so"; } catch (e) {}
  var subs = [];

  function apply() {
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-so]").forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === "so" ? el.dataset.so : el.dataset.en;
    });
    document.querySelectorAll("[data-so-ph]").forEach(function (el) {
      if (el.dataset.enPh === undefined) el.dataset.enPh = el.getAttribute("placeholder") || "";
      el.setAttribute("placeholder", lang === "so" ? el.dataset.soPh : el.dataset.enPh);
    });
    document.querySelectorAll("[data-so-label]").forEach(function (el) {
      if (el.dataset.enLabel === undefined) el.dataset.enLabel = el.getAttribute("aria-label") || "";
      el.setAttribute("aria-label", lang === "so" ? el.dataset.soLabel : el.dataset.enLabel);
    });
    var tSo = document.querySelector('meta[name="ag-title-so"]');
    var tEn = document.querySelector('meta[name="ag-title-en"]');
    if (tSo && tEn) document.title = lang === "so" ? tSo.content : tEn.content;
    document.querySelectorAll(".lang-toggle").forEach(function (b) {
      b.innerHTML = lang === "so" ? 'EN / <span class="cur">SO</span>' : '<span class="cur">EN</span> / SO';
    });
    subs.forEach(function (fn) { fn(lang); });
  }

  function setLang(next) {
    lang = next === "so" ? "so" : "en";
    try { localStorage.setItem(KEY, lang); } catch (e) {}
    apply();
  }

  window.AG = {
    get lang() { return lang; },
    t: function (en, so) { return lang === "so" && so != null ? so : en; },
    onLang: function (fn) { subs.push(fn); },
    esc: function (v) {
      return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }
  };

  document.querySelectorAll(".lang-toggle").forEach(function (b) {
    b.addEventListener("click", function () { setLang(lang === "so" ? "en" : "so"); });
  });

  var header = document.querySelector(".site-header");
  var menuBtn = document.querySelector(".menu-btn");
  if (header && menuBtn) {
    menuBtn.addEventListener("click", function () {
      var open = header.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });
  }

  var yr = document.getElementById("copyright-year");
  if (yr) yr.textContent = new Date().getFullYear();

  var homeForm = document.getElementById("home-search");
  if (homeForm) {
    homeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var q = document.getElementById("home-search-input").value.trim();
      window.location.href = "qaamuus.html" + (q ? "?q=" + encodeURIComponent(q) : "");
    });
  }

  /* Header: show "Sign out" instead of "Sign in" when a Supabase session is saved in this browser. */
  function signedIn() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (/^sb-.*-auth-token$/.test(k)) {
          var v = JSON.parse(localStorage.getItem(k) || "null");
          if (v && (v.user || (v.currentSession && v.currentSession.user))) return true;
        }
      }
    } catch (e) {}
    return false;
  }
  if (signedIn()) {
    var si = document.getElementById("nav-signin"), st = document.getElementById("nav-start");
    if (si) { si.innerHTML = "Sign out"; si.setAttribute("data-so", "Ka bax"); si.setAttribute("href", "login.html?logout=1"); }
    if (st) st.hidden = true;
  }

  apply();
})();
