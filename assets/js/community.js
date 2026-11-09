/* Community feed: anyone can read, signed-in members can post, delete their own posts, and report posts. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var esc = AG.esc;
  var cfg = window.AG_CONFIG || {};
  var PAGE = 20, MAX = 1000;
  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 && cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("YOUR-ANON") === -1;
  var sb = null, user = null, posts = [], more = false;

  function note(text, kind) {
    var m = $("c-msg"); m.className = "msg" + (kind ? " " + kind : ""); m.textContent = text || "";
  }
  function ago(iso) {
    var s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
    var units = [[60, "second", "ilbiriqsi"], [60, "minute", "daqiiqo"], [24, "hour", "saac"], [30, "day", "maalin"], [12, "month", "bil"], [1e9, "year", "sano"]];
    var n = s, i = 0;
    while (i < units.length - 1 && n >= units[i][0]) { n = Math.floor(n / units[i][0]); i++; }
    var en = n + " " + units[i][1] + (n === 1 ? "" : "s") + " ago";
    return AG.t(en, "ka hor " + n + " " + units[i][2]);
  }
  function card(p) {
    var name = (p.profiles && p.profiles.display_name) || "Member";
    var mine = user && p.user_id === user.id;
    return '<article class="card cpost" data-id="' + p.id + '"><header><strong>' + esc(name) + '</strong><time datetime="' + esc(p.created_at) + '">' + esc(ago(p.created_at)) + '</time></header>' +
      '<p>' + esc(p.body).replace(/\n/g, "<br>") + '</p><footer>' +
      (mine ? '<button type="button" class="link-btn" data-del="' + p.id + '">' + esc(AG.t("Delete", "Tirtir")) + '</button>'
            : (user ? '<button type="button" class="link-btn" data-report="' + p.id + '">' + esc(AG.t("Report", "Soo sheeg")) + '</button>' : "")) +
      '</footer></article>';
  }
  function renderFeed() {
    var box = $("c-feed");
    box.innerHTML = posts.length ? posts.map(card).join("") : '<p class="empty">' + esc(AG.t("No posts yet. Be the first to say hello!", "Weli qoraal ma jiro. Noqo kii ugu horreeya ee salaama!")) + '</p>';
    $("c-more").hidden = !more;
  }
  function renderAuth() {
    $("c-composer").hidden = !user;
    $("c-signin").hidden = !!user;
    if (user) $("c-who").textContent = user.user_metadata && user.user_metadata.display_name ? user.user_metadata.display_name : (user.email || "");
  }
  function load(reset) {
    var from = reset ? 0 : posts.length;
    return sb.from("posts").select("id,body,created_at,user_id,profiles(display_name)")
      .order("created_at", { ascending: false }).range(from, from + PAGE).then(function (r) {
        if (r.error) { note(AG.t("Could not load posts: ", "Qoraallada lama soo rari karin: ") + r.error.message, "err"); return; }
        var rows = r.data || [];
        more = rows.length > PAGE;
        rows = rows.slice(0, PAGE);
        posts = reset ? rows : posts.concat(rows);
        renderFeed();
      });
  }

  if (!configured) {
    $("c-setup").hidden = false; $("c-main").hidden = true; return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  sb.auth.getSession().then(function (r) {
    user = r.data && r.data.session ? r.data.session.user : null;
    renderAuth();
    return load(true);
  });
  sb.auth.onAuthStateChange(function (_e, session) { user = session ? session.user : null; renderAuth(); renderFeed(); });
  AG.onLang(function () { renderAuth(); renderFeed(); });

  var ta = $("c-text");
  ta.addEventListener("input", function () { $("c-count").textContent = ta.value.length + " / " + MAX; });
  $("c-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var body = ta.value.trim();
    if (!body) return;
    if (body.length > MAX) { note(AG.t("Posts can be up to 1000 characters.", "Qoraalku wuxuu noqon karaa ilaa 1000 xaraf."), "err"); return; }
    var btn = $("c-send"); btn.disabled = true; note("");
    sb.from("posts").insert({ body: body }).select("id,body,created_at,user_id,profiles(display_name)").single().then(function (r) {
      btn.disabled = false;
      if (r.error) {
        var limited = r.error.code === "42501" || /row-level security/i.test(r.error.message);
        note(limited ? AG.t("Slow down a little: you can post up to 3 times per minute.", "Yaraysii xawaaraha: waxaad qori kartaa ilaa 3 jeer daqiiqadii.") : r.error.message, "err");
        return;
      }
      ta.value = ""; $("c-count").textContent = "0 / " + MAX;
      posts.unshift(r.data); renderFeed();
    });
  });
  $("c-more").addEventListener("click", function () { load(false); });
  $("c-refresh").addEventListener("click", function () { note(""); load(true); });
  $("c-signout").addEventListener("click", function () { location.href = "login.html?logout=1"; });

  $("c-feed").addEventListener("click", function (e) {
    var del = e.target.closest("[data-del]"), rep = e.target.closest("[data-report]");
    if (del) {
      if (!confirm(AG.t("Delete this post?", "Ma tirtiraa qoraalkan?"))) return;
      sb.from("posts").delete().eq("id", del.dataset.del).then(function (r) {
        if (r.error) { note(r.error.message, "err"); return; }
        posts = posts.filter(function (p) { return String(p.id) !== del.dataset.del; }); renderFeed();
      });
    } else if (rep) {
      sb.from("reports").insert({ post_id: Number(rep.dataset.report) }).then(function (r) {
        if (r.error && r.error.code !== "23505") { note(r.error.message, "err"); return; }
        rep.outerHTML = '<span class="muted">' + esc(AG.t("Thanks, reported.", "Mahadsanid, waa la soo sheegay.")) + '</span>';
      });
    }
  });
})();
