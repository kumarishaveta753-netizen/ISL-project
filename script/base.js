/* ------------------------------------------------------------------
   SanketAI front-end behaviour
   1. Soft navigation: clicking the sidebar swaps the page content
      without a full reload, so the menu highlight and content can animate.
   2. ISL / ASL toggle, Learn-page filters and starred signs.
------------------------------------------------------------------- */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- ISL / ASL toggle (top bar + library tabs stay in sync) ---------- */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-lib]");
  if (!btn) return;
  $$("[data-lib]").forEach((b) => b.classList.toggle("active", b.dataset.lib === btn.dataset.lib));
});

/* ---------- Top bar shadow on scroll ---------- */
const topbar = $(".topbar");
const onScroll = () => topbar && topbar.classList.toggle("scrolled", window.scrollY > 8);
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ---------- Learn page: filters + stars ---------- */
function initLearn() {
  const grid = $("#sign-grid");
  if (!grid) return;

  const cards = $$(".sign-card", grid);
  const chips = $$(".chip");
  const empty = $("#empty");
  let filter = "all";

  cards.forEach((card, i) => card.style.setProperty("--i", i));

  function apply() {
    let shown = 0;
    cards.forEach((card) => {
      const saved = $(".star", card).getAttribute("aria-pressed") === "true";
      const ok = filter === "all" || (filter === "saved" ? saved : card.dataset.cat === filter);
      const wasHidden = card.hidden;
      card.hidden = !ok;
      if (ok && wasHidden && !reduceMotion) {
        card.classList.remove("fade-in");
        void card.offsetWidth;            // restart the animation
        card.style.setProperty("--i", shown);
        card.classList.add("fade-in");
      }
      if (ok) shown++;
    });
    empty.hidden = shown !== 0;
  }

  chips.forEach((chip) =>
    chip.addEventListener("click", () => {
      filter = chip.dataset.filter;
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      apply();
    })
  );

  cards.forEach((card) => {
    const star = $(".star", card);
    star.addEventListener("click", () => {
      const on = star.getAttribute("aria-pressed") !== "true";
      star.setAttribute("aria-pressed", on);
      star.textContent = on ? "★" : "☆";
      star.classList.remove("pop");
      void star.offsetWidth;
      if (on) star.classList.add("pop");
      apply();
    });
  });
}

/* ---------- Soft navigation ---------- */
function setActiveNav(pathname) {
  $$(".nav-item").forEach((a) => {
    const href = a.getAttribute("href");
    a.classList.toggle("active", !!href && href !== "#" && new URL(href, location.origin).pathname === pathname);
  });
}

let navigating = false;

async function navigate(url, push = true) {
  if (navigating) return;
  navigating = true;
  const content = $(".content");
  const target = new URL(url, location.origin);

  try {
    // Move the menu highlight right away, then fade the old content out
    setActiveNav(target.pathname);
    if (!reduceMotion) content.classList.add("leaving");

    const [res] = await Promise.all([fetch(target.href), wait(reduceMotion ? 0 : 140)]);
    if (!res.ok) throw new Error(res.status);
    const doc = new DOMParser().parseFromString(await res.text(), "text/html");

    document.title = doc.title;
    content.innerHTML = $(".content", doc).innerHTML;
    window.scrollTo({ top: 0 });
    if (push) history.pushState({}, "", target.pathname);

    content.classList.remove("leaving");
    content.classList.remove("entering");
    void content.offsetWidth;
    content.classList.add("entering");
    initLearn();
  } catch (err) {
    window.location.href = target.href;   // fall back to a normal page load
  } finally {
    navigating = false;
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || a.target || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const href = a.getAttribute("href");
  if (!href || href.startsWith("#")) return;
  const url = new URL(href, location.origin);
  if (url.origin !== location.origin || url.pathname === location.pathname) {
    if (url.pathname === location.pathname) e.preventDefault();
    return;
  }
  e.preventDefault();
  navigate(url.pathname);
});

window.addEventListener("popstate", () => navigate(location.pathname, false));

initLearn();
