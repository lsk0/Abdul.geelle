/* Sign in / Sign up / Reset password with Supabase Auth (email + password). */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var cfg = window.AG_CONFIG || {};
  var configured = cfg.SUPABASE_URL && cfg.SUPABASE_URL.indexOf("YOUR-PROJECT") === -1 && cfg.SUPABASE_ANON_KEY && cfg.SUPABASE_ANON_KEY.indexOf("YOUR-ANON") === -1;
  var sb = null, mode = "signin";

  function msg(text, kind) {
    var m = $("auth-msg");
    m.className = "msg" + (kind ? " " + kind : "");
    m.textContent = text || "";
  }
  function setMode(next) {
    mode = next;
    document.querySelectorAll("[data-mode]").forEach(function (b) { b.classList.toggle("on", b.dataset.mode === mode); b.setAttribute("aria-pressed", String(b.dataset.mode === mode)); });
    $("f-name-wrap").hidden = mode !== "signup";
    $("f-pass-wrap").hidden = mode === "reset";
    $("f-email-wrap").hidden = mode === "recovery";
    $("f-pass2-wrap").hidden = mode !== "recovery";
    $("f-pass").autocomplete = mode === "signin" ? "current-password" : "new-password";
    $("f-email").required = mode !== "recovery";
    $("f-pass").required = mode !== "reset";
    $("f-pass2").required = mode === "recovery";
    $("f-name").required = mode === "signup";
    $("f-pass-label").textContent = mode === "recovery" ? AG.t("New password", "Erayga sirta cusub") : AG.t("Password", "Erayga sirta");
    $("auth-forgot").hidden = mode !== "signin";
    $("auth-modes").hidden = mode === "recovery";
    var labels = {
      signin: ["Sign in", "Gal"], signup: ["Create account", "Samee akoon"],
      reset: ["Send reset link", "Dir xiriirka dib-u-dejinta"], recovery: ["Save new password", "Kaydi erayga sirta cusub"]
    };
    $("auth-submit").textContent = AG.t(labels[mode][0], labels[mode][1]);
    msg("");
  }
  function nextUrl() { return new URL("community.html", location.href).href; }
  function friendly(err) {
    var t = (err && err.message) || "Something went wrong.";
    if (/invalid login/i.test(t)) return AG.t("Wrong email or password.", "Email-ka ama erayga sirta waa khalad.");
    if (/already registered/i.test(t)) return AG.t("That email already has an account. Try signing in.", "Email-kaas horey ayuu akoon u leeyahay. Isku day inaad gasho.");
    if (/email not confirmed/i.test(t)) return AG.t("Please confirm your email first (check your inbox).", "Fadlan marka hore xaqiiji email-kaaga (eeg sanduuqaaga).");
    if (/rate limit/i.test(t)) return AG.t("Too many attempts. Please wait a few minutes and try again.", "Isku day badan. Fadlan sug dhowr daqiiqo oo mar kale isku day.");
    return t;
  }
  function showSignedIn(user) {
    $("auth-form-box").hidden = true;
    $("auth-done").hidden = false;
    $("auth-who").textContent = user.email || "";
  }

  if (!configured) {
    $("auth-form-box").hidden = true;
    $("auth-setup").hidden = false;
    return;
  }
  sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  var params = new URLSearchParams(location.search);
  setMode(params.get("mode") === "signup" ? "signup" : "signin");

  document.querySelectorAll("[data-mode]").forEach(function (b) {
    b.addEventListener("click", function () { setMode(b.dataset.mode); });
  });
  $("auth-forgot").addEventListener("click", function () { setMode("reset"); });
  AG.onLang(function () { setMode(mode); });

  sb.auth.onAuthStateChange(function (event) {
    if (event === "PASSWORD_RECOVERY") { $("auth-done").hidden = true; $("auth-form-box").hidden = false; setMode("recovery"); }
  });

  $("auth-signout").addEventListener("click", function () {
    sb.auth.signOut().then(function () { location.href = "login.html"; });
  });

  $("auth-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var email = $("f-email").value.trim(), pass = $("f-pass").value, btn = $("auth-submit");
    btn.disabled = true; msg("");
    var p;
    if (mode === "signin") {
      p = sb.auth.signInWithPassword({ email: email, password: pass }).then(function (r) {
        if (r.error) throw r.error; location.href = nextUrl();
      });
    } else if (mode === "signup") {
      var name = $("f-name").value.trim();
      if (name.length < 2) { msg(AG.t("Please choose a display name (at least 2 letters).", "Fadlan dooro magac muuqda (ugu yaraan 2 xaraf)."), "err"); btn.disabled = false; return; }
      if (pass.length < 8) { msg(AG.t("Password must be at least 8 characters.", "Erayga sirta waa inuu ahaadaa ugu yaraan 8 xaraf."), "err"); btn.disabled = false; return; }
      p = sb.auth.signUp({ email: email, password: pass, options: { data: { display_name: name }, emailRedirectTo: new URL("login.html", location.href).href } }).then(function (r) {
        if (r.error) throw r.error;
        if (r.data.session) { location.href = nextUrl(); return; }
        msg(AG.t("Almost done! We sent a confirmation link to your email. Click it, then sign in.", "Waa kuu dhowaaday! Waxaan email-kaaga u dirnay xiriir xaqiijin ah. Taabo, kadibna gal."), "ok");
      });
    } else if (mode === "reset") {
      p = sb.auth.resetPasswordForEmail(email, { redirectTo: new URL("login.html", location.href).href }).then(function (r) {
        if (r.error) throw r.error;
        msg(AG.t("If that email has an account, a reset link is on its way.", "Haddii email-kaas akoon leeyahay, xiriir dib-u-dejin ah ayaa soo socda."), "ok");
      });
    } else {
      var p1 = $("f-pass").value, p2 = $("f-pass2").value;
      if (p1.length < 8) { msg(AG.t("Password must be at least 8 characters.", "Erayga sirta waa inuu ahaadaa ugu yaraan 8 xaraf."), "err"); btn.disabled = false; return; }
      if (p1 !== p2) { msg(AG.t("The two passwords do not match.", "Labada eray sir isma waafaqaan."), "err"); btn.disabled = false; return; }
      p = sb.auth.updateUser({ password: p1 }).then(function (r) {
        if (r.error) throw r.error; location.href = nextUrl();
      });
    }
    p.catch(function (err) { msg(friendly(err), "err"); }).then(function () { btn.disabled = false; });
  });

  if (params.get("logout") === "1") {
    sb.auth.signOut().then(function () { msg(AG.t("You have been signed out.", "Waad ka baxday."), "ok"); });
  } else {
    sb.auth.getSession().then(function (r) {
      if (r.data && r.data.session && !/type=recovery/.test(location.hash)) showSignedIn(r.data.session.user);
    });
  }
})();
