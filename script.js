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
