/* ============================================================
   유령제작소 — site interactions
   nav state · mobile menu · scroll reveal · blog filter · beta form
   ============================================================ */

/* 베타 폼 외부 연동: Formspree 등 엔드포인트를 넣으면 바로 전송됩니다.
   비워두면 UI는 동작하되 안내 메시지만 표시됩니다.
   예) const FORM_ENDPOINT = "https://formspree.io/f/xxxxxx"; */
const FORM_ENDPOINT = "";

/* ---------- Nav scroll state (no scroll listener) ---------- */
const nav = document.getElementById("nav");
const topSentinel = document.getElementById("topSentinel");
if (nav && topSentinel && "IntersectionObserver" in window) {
  new IntersectionObserver(
    ([entry]) => nav.classList.toggle("is-scrolled", !entry.isIntersecting),
    { threshold: 0 }
  ).observe(topSentinel);
}

/* ---------- Mobile menu ---------- */
const navToggle = document.getElementById("navToggle");
const navLinks = document.querySelector(".nav__links");
if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
  navLinks.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      navLinks.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "메뉴 열기");
    }
  });
}

/* ---------- Blog category dropdown (injected into nav, all pages) ---------- */
if (navLinks) {
  const blogLink = navLinks.querySelector('a[href="blog.html"]');
  if (blogLink) {
    const cats = [
      { label: "전체", href: "blog.html", cls: "" },
      { label: "마지막 20%", href: "blog.html?category=last-20", cls: "is-20" },
      { label: "Fix Lab", href: "blog.html?category=fix-lab", cls: "is-fix" },
      { label: "Worknote", href: "blog.html?category=worknote", cls: "is-note" },
    ];
    const drop = document.createElement("div");
    drop.className = "nav__drop";
    const submenu = document.createElement("div");
    submenu.className = "nav__submenu";
    submenu.setAttribute("role", "menu");
    cats.forEach((c) => {
      const a = document.createElement("a");
      a.href = c.href;
      a.className = ("nav__subitem " + c.cls).trim();
      a.textContent = c.label;
      a.setAttribute("role", "menuitem");
      submenu.appendChild(a);
    });
    blogLink.classList.add("nav__droptrigger");
    blogLink.setAttribute("aria-haspopup", "true");
    navLinks.insertBefore(drop, blogLink);
    drop.appendChild(blogLink);
    drop.appendChild(submenu);
  }
}

/* ---------- Scroll reveal ---------- */
const revealTargets = document.querySelectorAll(
  ".shead, .pcard, .cat, .ctaband, .split, .pain__item, .ratio, .statlist, .article__head, .prose > *, .ba, .callout, .beta-aside, .form"
);
revealTargets.forEach((el, i) => {
  el.classList.add("reveal");
  el.style.transitionDelay = `${Math.min((i % 4) * 60, 180)}ms`;
});
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
  );
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

/* ---------- Blog category filter ---------- */
const tabs = document.querySelectorAll(".tab[data-category]");
const posts = document.querySelectorAll(".bloglist .pcard[data-category]");
const blogEmpty = document.getElementById("blogEmpty");

const applyCategory = (category) => {
  let visible = 0;
  tabs.forEach((tab) => {
    const active = tab.dataset.category === category;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  posts.forEach((post) => {
    const show = category === "all" || post.dataset.category === category;
    post.classList.toggle("is-hidden", !show);
    if (show) visible += 1;
  });
  if (blogEmpty) blogEmpty.style.display = visible ? "none" : "block";
};

if (tabs.length && posts.length) {
  const initial = new URLSearchParams(window.location.search).get("category") || "all";
  applyCategory(tabs.length && [...tabs].some((t) => t.dataset.category === initial) ? initial : "all");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const category = tab.dataset.category;
      applyCategory(category);
      const url = category === "all" ? "blog.html" : `blog.html?category=${category}`;
      window.history.replaceState({}, "", url);
    });
  });
}

/* ---------- Beta form ---------- */
const form = document.getElementById("betaForm");
const formMsg = document.getElementById("formMsg");
const submitBtn = document.getElementById("submitBtn");
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

if (form && formMsg && submitBtn) {
  const setMsg = (text, type) => {
    formMsg.textContent = text;
    formMsg.classList.remove("is-error", "is-ok");
    if (type) formMsg.classList.add(`is-${type}`);
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();

    if (!name) return setMsg("이름을 입력해주세요.", "error");
    if (!isEmail(email)) return setMsg("올바른 이메일 주소를 입력해주세요.", "error");

    if (!FORM_ENDPOINT) {
      setMsg("신청 폼이 곧 연결됩니다. (관리자: script.js의 FORM_ENDPOINT 설정 필요)", "ok");
      return;
    }

    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = data[key] ? `${data[key]}, ${value}` : value;
    });
    data._subject = "[유령제작소] 새 베타 신청";

    submitBtn.disabled = true;
    const original = submitBtn.textContent;
    submitBtn.textContent = "신청 중...";
    setMsg("");

    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("failed");
      form.reset();
      setMsg("신청이 완료되었습니다. 준비가 되면 이메일로 안내드릴게요.", "ok");
      submitBtn.textContent = "신청 완료";
    } catch (err) {
      setMsg("전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.", "error");
      submitBtn.disabled = false;
      submitBtn.textContent = original;
    }
  });
}

/* ============================================================
   Interactive pointer effects (cursor glow · card spotlight · magnetic)
   transform/opacity only · gated by reduced-motion & fine pointer
   ============================================================ */
(function () {
  var fine = window.matchMedia("(any-pointer: fine)").matches;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduce) return;

  /* cursor-follow glow with easing */
  var glow = document.createElement("div");
  glow.className = "cursor-glow";
  document.body.appendChild(glow);
  var tx = window.innerWidth / 2, ty = window.innerHeight / 2, cx = tx, cy = ty, raf = 0;
  function loop() {
    cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
    glow.style.transform = "translate(" + cx + "px," + cy + "px)";
    if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) { raf = requestAnimationFrame(loop); }
    else { raf = 0; }
  }
  window.addEventListener("pointermove", function (e) {
    tx = e.clientX; ty = e.clientY;
    if (!raf) raf = requestAnimationFrame(loop);
  }, { passive: true });

  /* card spotlight follows cursor inside the card */
  document.querySelectorAll(".pcard, .cat").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
      card.style.setProperty("--spot", "0.16");
    });
    card.addEventListener("pointerleave", function () {
      card.style.setProperty("--spot", "0");
    });
  });

  /* magnetic primary buttons */
  document.querySelectorAll(".btn--accent").forEach(function (btn) {
    btn.addEventListener("pointermove", function (e) {
      var r = btn.getBoundingClientRect();
      var mx = e.clientX - r.left - r.width / 2;
      var my = e.clientY - r.top - r.height / 2;
      btn.style.transform = "translate(" + (mx * 0.25) + "px," + (my * 0.4) + "px)";
    });
    btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
  });
})();
/* ============================================================
   Interactive hero demo — drag a box to "finish" that region
   ============================================================ */
(function () {
  var stage = document.getElementById("demoStage");
  if (!stage) return;
  var sharp = document.getElementById("demoSharp");
  var sel = document.getElementById("demoSel");
  var BW = 0.46, BH = 0.44;          // box size as fraction of stage
  var cx = 0.5, cy = 0.5;            // box center as fraction
  var auto = true;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function render() {
    var W = stage.clientWidth, H = stage.clientHeight;
    var w = W * BW, h = H * BH;
    var x = Math.max(0, Math.min(W - w, cx * W - w / 2));
    var y = Math.max(0, Math.min(H - h, cy * H - h / 2));
    sel.style.left = x + "px"; sel.style.top = y + "px";
    sel.style.width = w + "px"; sel.style.height = h + "px";
    sharp.style.clipPath = "inset(" + y + "px " + (W - x - w) + "px " + (H - y - h) + "px " + x + "px round 11px)";
  }
  function moveTo(e) {
    var r = stage.getBoundingClientRect();
    cx = (e.clientX - r.left) / r.width;
    cy = (e.clientY - r.top) / r.height;
    render();
  }

  var down = false;
  stage.addEventListener("pointerdown", function (e) {
    auto = false; down = true;
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
    moveTo(e);
  });
  stage.addEventListener("pointermove", function (e) { if (down) moveTo(e); });
  stage.addEventListener("pointerup", function () { down = false; });
  window.addEventListener("resize", render);

  // idle auto-sweep to signal interactivity until the user grabs it
  var t = 0;
  function tick() {
    if (!auto) return;
    if (!reduce) {
      t += 0.014;
      cx = 0.5 + Math.sin(t) * 0.27;
      cy = 0.5 + Math.cos(t * 0.8) * 0.17;
      render();
    }
    requestAnimationFrame(tick);
  }
  render();
  tick();
})();