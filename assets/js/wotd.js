/* Word of the day + random word. Data: assets/data/wotd.json (1,500 words taken from the dictionary). */
(function () {
  "use strict";
  var list = null, loading = null;
  function load() {
    if (list) return Promise.resolve(list);
    if (!loading) loading = fetch("assets/data/wotd.json").then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    }).then(function (d) { list = d; return d; });
    return loading;
  }
  function today(l) {
    var d = new Date();
    var day = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
    return l[day % l.length];
  }
  function random(l, not) {
    var w;
    do { w = l[Math.floor(Math.random() * l.length)]; } while (l.length > 1 && w === not);
    return w;
  }
  window.AGWord = { load: load, today: today, random: random };

  var esc = AG.esc;
  document.querySelectorAll("[data-wotd]").forEach(function (box) {
    var current = null, isRandom = false;
    function render() {
      if (!current) return;
      box.innerHTML = '<div class="card wotd-card"><span class="eyebrow">' + esc(isRandom ? AG.t("Random word", "Eray random ah") : AG.t("Word of the day", "Ereyga maanta")) +
        '</span><h3 class="wotd-word">' + esc(current.w) + '</h3><span class="gram">' + esc(current.g) + '</span><p class="def">' + esc(current.d) + '</p>' +
        '<div class="actions-row"><button type="button" class="btn" data-random>' + esc(AG.t("New random word", "Eray random ah oo cusub")) + '</button>' +
        '<a class="btn primary" href="qaamuus.html#' + encodeURIComponent(current.w) + '">' + esc(AG.t("Open in Qaamuus", "Ku fur Qaamuuska")) + '</a></div></div>';
    }
    box.addEventListener("click", function (e) {
      if (!e.target.closest("[data-random]") || !list) return;
      current = random(list, current); isRandom = true; render();
    });
    AG.onLang(render);
    box.innerHTML = '<div class="card wotd-card"><p class="empty">' + esc(AG.t("Loading…", "Waa la soo rarayaa…")) + '</p></div>';
    load().then(function (l) { current = today(l); render(); }).catch(function () {
      box.innerHTML = '<div class="card wotd-card"><p class="empty">' + esc(AG.t("Word of the day is unavailable right now.", "Ereyga maanta hadda lama heli karo.")) + '</p></div>';
    });
  });
})();
