/* Add published entries to POSTS, then upload this file to GitHub.
   category must be exactly one of: "Reading List", "Media", "Somali".
   The Home page and the Blog page show every entry automatically. */
const POSTS = [
  {
    title: "Muhiimadda Akhriska",
    category: "Somali",
    date: "2026-10-21",
    content: "Akhrisku wuxuu kobciyaa aqoonta, fahamka iyo fikirka qofka."
  },
  {
    title: "A Documentary Worth Watching",
    category: "Media",
    date: "2026-10-21",
    content: "A documentary I enjoyed and recommend watching. This is a sample post to test the Media section."
  },
  {
    title: "A Book to Read",
    category: "Reading List",
    date: "2026-10-21",
    content: "A book I plan to read and share my thoughts about. This is a sample post to test the Reading List section."
  }
];

(function () {
  "use strict";
  var CATS = {
    "Reading List": { slug: "reading-list", so: "Liiska Akhriska",
      en_desc: "Books, essays, and writing I want to read, revisit, and recommend.",
      so_desc: "Buugaag, maqaal iyo qoraallo aan doonayo inaan akhriyo, dib ugu noqdo, kuna taliyo." },
    "Media": { slug: "media", so: "Warbaahin",
      en_desc: "Films, videos, articles, music, and other media I want to share.",
      so_desc: "Filimaan, muuqaallo, maqaallo, muusig iyo warbaahin kale oo aan doonayo inaan wadaago." },
    "Somali": { slug: "somali", so: "Soomaali", en_desc: "", so_desc: "" }
  };
  var ORDER = ["Reading List", "Media", "Somali"];
  var esc = AG.esc;

  function sorted() {
    return POSTS.map(function (p, i) { return { p: p, i: i }; })
      .sort(function (a, b) {
        var da = a.p.date || "", db = b.p.date || "";
        return da < db ? 1 : da > db ? -1 : b.i - a.i;
      }).map(function (x) { return x.p; });
  }
  function fmtDate(s) {
    if (!s) return "";
    var d = new Date(s + "T00:00:00");
    if (isNaN(d)) return s;
    try { return d.toLocaleDateString(AG.lang === "so" ? "so" : "en", { year: "numeric", month: "long", day: "numeric" }); }
    catch (e) { return s; }
  }
  function catLabel(c) { return AG.lang === "so" && CATS[c] ? CATS[c].so : c; }
  function card(p) {
    return '<article class="card post"><span class="cat">' + esc(catLabel(p.category)) + '</span><h3>' + esc(p.title) +
      '</h3><time datetime="' + esc(p.date || "") + '">' + esc(fmtDate(p.date)) + '</time><p>' +
      esc(p.content || "").replace(/\n/g, "<br>") + '</p></article>';
  }
  function list(items) {
    return items.length ? items.map(card).join("") : '<p class="empty">' + esc(AG.t("No posts yet.", "Weli qoraallo ma jiraan.")) + '</p>';
  }

  var latest = document.querySelector('[data-posts="latest"]');
  var blog = document.querySelector('[data-posts="blog"]');
  var chipsBox = document.getElementById("blog-filters");
  var descBox = document.getElementById("blog-desc");
  var current = "all";

  function slugToCat(slug) {
    for (var k in CATS) if (CATS[k].slug === slug) return k;
    return "all";
  }
  function renderLatest() { if (latest) latest.innerHTML = list(sorted().slice(0, 6)); }
  function renderBlog() {
    if (!blog) return;
    if (chipsBox) {
      var all = [["all", AG.t("All", "Dhammaan")]].concat(ORDER.map(function (c) { return [c, catLabel(c)]; }));
      chipsBox.innerHTML = all.map(function (x) {
        return '<button type="button" class="chip' + (current === x[0] ? " on" : "") + '" data-filter="' + esc(x[0]) + '" aria-pressed="' + (current === x[0]) + '">' + esc(x[1]) + '</button>';
      }).join("");
    }
    if (descBox) {
      var c = CATS[current];
      descBox.textContent = c ? (AG.lang === "so" ? c.so_desc : c.en_desc)
        : AG.t("Posts from my Reading List, Media, and Somali sections appear here together.",
               "Qoraallada Liiska Akhriska, Warbaahinta iyo Soomaalida ayaa halkan ku wada muuqda.");
    }
    blog.innerHTML = list(sorted().filter(function (p) { return current === "all" || p.category === current; }));
  }
  function readHash() { current = slugToCat(decodeURIComponent(location.hash.slice(1))); renderBlog(); }

  if (chipsBox) {
    chipsBox.addEventListener("click", function (e) {
      var b = e.target.closest("[data-filter]");
      if (!b) return;
      current = b.dataset.filter;
      history.replaceState(null, "", current === "all" ? location.pathname : "#" + CATS[current].slug);
      renderBlog();
    });
  }
  window.addEventListener("hashchange", readHash);
  AG.onLang(function () { renderLatest(); renderBlog(); });
  renderLatest();
  if (blog) readHash();
})();
