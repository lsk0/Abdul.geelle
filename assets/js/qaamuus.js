/* Qaamuus: searchable, browsable Somali dictionary. Data: assets/data/qaamuus.json */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = AG.esc;
  var PAGE = 50;
  var ALPHABET = ["A","B","T","J","X","KH","D","R","S","SH","DH","C","G","F","Q","K","L","M","N","W","H","Y","E","I","O","U"];
  var SUPMAP = { "¹":1,"²":2,"³":3,"⁴":4,"⁵":5,"⁶":6,"⁷":7,"⁸":8,"⁹":9,"⁰":0 };

  var groups = [], byKey = new Map(), byLetter = {};
  var activeLetter = "", query = "", shown = PAGE, found = [], selected = null, timer = null;

  function fold(s) {
    return String(s == null ? "" : s).toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[’‘ʼ]/g, "'").trim();
  }
  function splitWord(w) {
    var m = /([¹²³⁴⁵⁶⁷⁸⁹⁰]+|\d+)$/.exec(w);
    if (!m) return { base: w, hom: 0 };
    var n = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : m[1].split("").map(function (c) { return SUPMAP[c]; }).join("");
    return { base: w.slice(0, m.index), hom: parseInt(n, 10) || 0 };
  }
  function letterOf(word) {
    var w = fold(word).replace(/^[^a-z]+/, "").toUpperCase();
    var two = w.slice(0, 2);
    return two === "KH" || two === "SH" || two === "DH" ? two : w.slice(0, 1);
  }
  function status(msg) { $("q-status").textContent = msg; }

  function build(entries) {
    entries.forEach(function (e) {
      var s = splitWord(e.word);
      var key = fold(s.base);
      var g = byKey.get(key);
      if (!g) { g = { key: key, word: s.base, entries: [], defs: "" }; byKey.set(key, g); groups.push(g); }
      g.entries.push({ hom: s.hom, word: e.word, grammar: e.grammar, definition: e.definition, page: e.printedPage });
      g.defs += " " + fold(e.definition);
    });
    groups.forEach(function (g) {
      var L = letterOf(g.word);
      (byLetter[L] = byLetter[L] || []).push(g);
    });
  }

  /* ---------- rendering ---------- */
  function renderAlphabet() {
    $("q-alpha").innerHTML = ALPHABET.map(function (L) {
      var on = activeLetter === L;
      return '<button type="button" data-letter="' + L + '" class="' + (on ? "on" : "") + '" aria-pressed="' + on + '">' + L + '</button>';
    }).join("");
  }
  function row(g) {
    var e = g.entries[0];
    var n = g.entries.length > 1 ? '<span class="n">' + g.entries.length + '</span>' : "";
    return '<button type="button" class="row' + (selected === g ? " on" : "") + '" data-key="' + esc(g.key) + '"><span class="w">' + esc(g.word) +
      '</span><span class="g">' + esc(e.grammar) + '</span>' + n + '<span class="d">' + esc(e.definition) + '</span></button>';
  }
  function search(q) {
    var f = fold(q), t0 = [], t1 = [], t2 = [], t3 = [];
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      if (g.key === f) t0.push(g);
      else if (g.key.indexOf(f) === 0) t1.push(g);
      else if (g.key.indexOf(f) > -1) t2.push(g);
      else if (t3.length < 2000 && g.defs.indexOf(f) > -1) t3.push(g);
    }
    return t0.concat(t1, t2, t3);
  }
  function renderResults() {
    if (query) found = search(query);
    else if (activeLetter) found = byLetter[activeLetter] || [];
    else found = groups;
    var slice = found.slice(0, shown);
    var html = slice.length ? slice.map(row).join("") :
      '<div class="row" style="cursor:default">' + esc(AG.t("No matching entry found. Try another spelling or browse a letter.",
        "Eray ku habboon lama helin. Isku day higgaad kale ama xaraf dooro.")) + '</div>';
    if (found.length > shown) {
      html += '<button type="button" class="btn more" id="q-more">' +
        esc(AG.t("Show more", "Muuji wax dheeraad ah")) + ' (' + (found.length - shown).toLocaleString() + ')</button>';
    }
    $("q-results").innerHTML = html;
    var total = groups.length.toLocaleString();
    if (query) status(AG.t(found.length.toLocaleString() + (found.length === 1 ? " result" : " results") + ' for "' + query + '"',
                           found.length.toLocaleString() + ' natiijo: "' + query + '"'));
    else if (activeLetter) status(AG.t("Browsing " + activeLetter + " · " + found.length.toLocaleString() + " words",
                                       "Waxaad baadhaysaa " + activeLetter + " · " + found.length.toLocaleString() + " eray"));
    else status(AG.t("Search across " + total + " words", "Ka dhex raadi " + total + " eray"));
  }

  function linkify(text) {
    var re = /\b(eeg|ld)\s+((?:[\p{L}'’ʼ-]+[¹²³⁴⁵⁶⁷⁸⁹⁰]?(?:\s*\(\d+\))?(?:,\s*)?)+)/giu;
    var out = "", last = 0, m;
    while ((m = re.exec(text))) {
      out += esc(text.slice(last, m.index)) + esc(m[1]) + " ";
      out += m[2].replace(/([\p{L}'’ʼ-]+)([¹²³⁴⁵⁶⁷⁸⁹⁰]?)((?:\s*\(\d+\))?)(,?\s*)/giu, function (all, w, sup, par, sep) {
        var key = fold(w);
        var inner = esc(w + sup) + esc(par);
        return (byKey.has(key) ? '<a href="#' + encodeURIComponent(w) + '" data-key="' + esc(key) + '">' + inner + '</a>' : inner) + esc(sep);
      });
      last = re.lastIndex;
    }
    return out + esc(text.slice(last));
  }

  function showEntry(g, push) {
    selected = g;
    var senses = g.entries.map(function (e) {
      var hom = g.entries.length > 1 && e.hom ? '<span class="hom">' + e.hom + '</span>' : "";
      return '<div class="sense"><div class="meta">' + hom + '<span class="gram">' + esc(e.grammar) + '</span>' +
        '<span class="pg">' + esc(AG.t("Page", "Bogga")) + ' ' + esc(e.page) + '</span></div><p class="def">' + linkify(e.definition) + '</p></div>';
    }).join("");
    var pages = g.entries.map(function (e) { return e.page; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).join(", ");
    $("q-entry").innerHTML = '<div class="entry"><h2>' + esc(g.word) + '</h2>' + senses +
      '<div class="entry-src">' + esc(AG.t("Source: Qaamuuska Af-Soomaaliga · printed page " + pages,
                                          "Isha: Qaamuuska Af-Soomaaliga · bogga daabacan " + pages)) + '</div></div>';
    if (push !== false) history.replaceState(null, "", location.pathname + location.search + "#" + encodeURIComponent(g.word));
    markSelected();
    if (window.matchMedia("(max-width: 900px)").matches) $("q-entry-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function markSelected() {
    document.querySelectorAll("#q-results .row").forEach(function (r) { r.classList.toggle("on", !!selected && r.dataset.key === selected.key); });
  }
  var wotdPick = null;
  function wordOfTheDay() {
    if (wotdPick) { var wg = findGroup(wotdPick.w); if (wg) return wg; }
    var pool = groups.filter(function (g) {
      var d = g.entries[0].definition;
      return d.length > 35 && d.length < 220 && !/^(eeg|ld)\b/i.test(d);
    });
    return pool[Math.floor(Date.now() / 86400000) % pool.length];
  }
  function renderEmptyEntry() {
    selected = null;
    var w = wordOfTheDay();
    $("q-entry").innerHTML = '<div class="wotd"><span class="eyebrow">' + esc(AG.t("Word of the day", "Ereyga maanta")) + '</span><h3><button type="button" data-key="' +
      esc(w.key) + '">' + esc(w.word) + '</button></h3><p class="gram" style="display:inline-block">' + esc(w.entries[0].grammar) + '</p><p class="def">' +
      linkify(w.entries[0].definition) + '</p><p class="empty" style="margin-top:1rem">' +
      esc(AG.t("Search for a word, or pick a letter to browse. Select any result to read its full entry.",
               "Raadi eray, ama dooro xaraf si aad u daalacato. Dooro natiijo kasta si aad u akhrido qeexitaankeeda oo buuxa.")) + '</p></div>';
    markSelected();
  }

  function findGroup(word) {
    var k = fold(splitWord(word).base);
    return byKey.get(k) || byKey.get(fold(word));
  }
  function openByKey(key) { var g = byKey.get(key); if (g) showEntry(g); }

  /* ---------- events ---------- */
  $("q-search").addEventListener("input", function () {
    clearTimeout(timer);
    timer = setTimeout(function () { query = $("q-search").value.trim(); activeLetter = ""; shown = PAGE; renderAlphabet(); renderResults(); }, 120);
  });
  $("q-form").addEventListener("submit", function (e) {
    e.preventDefault();
    clearTimeout(timer);
    query = $("q-search").value.trim(); activeLetter = ""; shown = PAGE; renderAlphabet(); renderResults();
    if (found[0] && query) showEntry(found[0]);
  });
  $("q-alpha").addEventListener("click", function (e) {
    var b = e.target.closest("[data-letter]"); if (!b) return;
    activeLetter = activeLetter === b.dataset.letter ? "" : b.dataset.letter;
    query = ""; $("q-search").value = ""; shown = PAGE; renderAlphabet(); renderResults();
    $("q-results").scrollTop = 0;
  });
  $("q-results").addEventListener("click", function (e) {
    if (e.target.closest("#q-more")) { shown += PAGE; renderResults(); return; }
    var r = e.target.closest("[data-key]"); if (r) openByKey(r.dataset.key);
  });
  $("q-entry").addEventListener("click", function (e) {
    var a = e.target.closest("[data-key]"); if (!a) return;
    e.preventDefault(); openByKey(a.dataset.key);
  });
  $("q-clear").addEventListener("click", function () {
    $("q-search").value = ""; query = ""; activeLetter = ""; shown = PAGE;
    renderAlphabet(); renderResults(); renderEmptyEntry();
    history.replaceState(null, "", location.pathname); $("q-search").focus();
  });
  window.addEventListener("hashchange", function () {
    var h = decodeURIComponent(location.hash.slice(1)); var g = h && findGroup(h); if (g && g !== selected) showEntry(g, false);
  });
  AG.onLang(function () {
    if (!groups.length) return;
    renderAlphabet(); renderResults();
    if (selected) showEntry(selected, false); else renderEmptyEntry();
  });

  /* ---------- start ---------- */
  status(AG.t("Loading the dictionary…", "Qaamuuska ayaa la soo rarayaa…"));
  fetch("assets/data/qaamuus.json").then(function (r) {
    if (!r.ok) throw new Error("HTTP " + r.status);
    return r.json();
  }).then(function (entries) {
    build(entries);
    var params = new URLSearchParams(location.search);
    query = (params.get("q") || "").trim();
    $("q-search").value = query;
    renderAlphabet(); renderResults();
    var h = decodeURIComponent(location.hash.slice(1));
    var g = h && findGroup(h);
    if (g) showEntry(g, false);
    else if (query && found[0]) showEntry(found[0], false);
    else renderEmptyEntry();
    if (window.AGWord) AGWord.load().then(function (l) { wotdPick = AGWord.today(l); if (!selected) renderEmptyEntry(); }).catch(function () {});
  }).catch(function (err) {
    console.error(err);
    status(AG.t("The dictionary data could not be loaded. Please refresh the page or try again later.",
                "Xogta qaamuuska lama soo rari karin. Fadlan bogga dib u cusboonaysii ama mar kale isku day."));
  });
})();
