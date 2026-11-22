/* =========================================================
   Thermodynamics Learning Module — shared behaviour
   - top bar with lesson progress dots
   - auto table of contents from <h2 id="...">
   - previous / next lesson links
   - multiple-choice quizzes, numeric answer checks
   - step-by-step reveal for worked examples
   ========================================================= */

const LESSONS = [
  { n: 1, file: "01-introduction.html",           title: "What is thermodynamics?" },
  { n: 2, file: "02-system-surroundings.html",    title: "System & surroundings" },
  { n: 3, file: "03-energy-heat-work.html",       title: "Internal energy, heat & work" },
  { n: 4, file: "04-first-law.html",              title: "The first law" },
  { n: 5, file: "05-state-path-functions.html",   title: "State vs path functions" },
  { n: 6, file: "06-calculations.html",           title: "Worked calculations" },
  { n: 7, file: "07-reversible-irreversible.html", title: "Reversible vs irreversible" },
  { n: 8, file: "08-enthalpy.html",               title: "Enthalpy" },
  { n: 9, file: "09-hess-law.html",               title: "Hess's law & calculating ΔH" },
  { n: 10, file: "10-second-law.html",            title: "Nature's one-way street: the second law" },
  { n: 11, file: "11-spontaneity.html",           title: "Spontaneity: the universe keeps score" },
];

const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } },
};

(function init() {
  const body = document.body;
  const lessonNum = Number(body.dataset.lesson || 0);
  const root = body.dataset.root || "";
  const lessonPath = (f) => root + "lessons/" + f;

  // theme
  const savedTheme = store.get("thermo-theme");
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  // visited
  const visited = new Set(store.get("thermo-visited") || []);
  if (lessonNum) { visited.add(lessonNum); store.set("thermo-visited", [...visited]); }

  // top bar
  const top = document.getElementById("topbar");
  if (top) {
    top.className = "topbar";
    top.innerHTML = `
      <div class="topbar-inner">
        <a class="brand" href="${root}index.html" title="Module home">
          <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
            <rect x="3" y="3" width="26" height="26" rx="7" fill="var(--sys-fill)" stroke="var(--sys)" stroke-width="2"/>
            <path d="M10 22 C 13 12, 19 12, 22 22" stroke="var(--heat)" stroke-width="3" fill="none" stroke-linecap="round"/>
            <circle cx="16" cy="11" r="3" fill="var(--work)"/>
          </svg>
          <span>Thermodynamics</span>
        </a>
        <nav class="progress-dots" aria-label="Lessons">
          ${LESSONS.map(l => `<a href="${lessonPath(l.file)}" title="${l.n}. ${l.title}"
              class="${l.n === lessonNum ? "current" : ""} ${visited.has(l.n) ? "visited" : ""}">${l.n}</a>`).join("")}
        </nav>
        <button class="theme-toggle" type="button" aria-label="Toggle dark mode">◐</button>
      </div>`;
    top.querySelector(".theme-toggle").addEventListener("click", () => {
      const isDark = document.documentElement.dataset.theme === "dark" ||
        (!document.documentElement.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
      const next = isDark ? "light" : "dark";
      document.documentElement.dataset.theme = next;
      store.set("thermo-theme", next);
      document.dispatchEvent(new CustomEvent("themechange"));
    });
  }

  // roadmap visited state on index
  document.querySelectorAll(".roadmap a[data-n]").forEach(a => {
    if (visited.has(Number(a.dataset.n))) a.classList.add("visited");
  });

  // table of contents
  const toc = document.querySelector(".toc");
  if (toc) {
    const heads = [...document.querySelectorAll("main h2[id]")];
    toc.innerHTML = `<h4>On this page</h4><ol>${heads.map(h =>
      `<li><a href="#${h.id}">${h.dataset.short || h.textContent}</a></li>`).join("")}</ol>`;
    const links = [...toc.querySelectorAll("a")];
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    heads.forEach(h => obs.observe(h));
  }

  // previous / next
  const nav = document.querySelector(".lesson-nav");
  if (nav && lessonNum) {
    const prev = LESSONS[lessonNum - 2];
    const next = LESSONS[lessonNum];
    nav.innerHTML =
      (prev ? `<a class="prev" href="${prev.file}"><small>← Lesson ${prev.n}</small>${prev.title}</a>`
            : `<a class="prev" href="${root}index.html"><small>← Home</small>Module overview</a>`) +
      (next ? `<a class="next" href="${next.file}"><small>Lesson ${next.n} →</small>${next.title}</a>`
            : `<a class="next" href="${root}index.html"><small>Finished →</small>Back to overview</a>`);
  }

  // multiple-choice quizzes:
  // <div class="quiz" data-answer="1"> <p class="quiz-q">..</p>
  //   <div class="quiz-opts"><button>..</button>...</div>
  //   <div class="quiz-fb" data-right="..." data-wrong="..."></div></div>
  document.querySelectorAll(".quiz").forEach(qz => {
    const answer = Number(qz.dataset.answer);
    const btns = [...qz.querySelectorAll(".quiz-opts button")];
    const fb = qz.querySelector(".quiz-fb");
    btns.forEach((b, i) => b.addEventListener("click", () => {
      btns.forEach(x => x.classList.remove("right", "wrong"));
      const ok = i === answer;
      b.classList.add(ok ? "right" : "wrong");
      if (ok) btns[answer].classList.add("right");
      if (fb) {
        const specific = b.dataset.why;
        fb.innerHTML = (ok ? "✅ <b>Correct.</b> " : "❌ <b>Not quite.</b> ") +
          (specific || (ok ? fb.dataset.right : fb.dataset.wrong) || "");
        fb.className = "quiz-fb show " + (ok ? "good" : "bad");
      }
    }));
  });

  // step-by-step reveal:
  // <ol class="steps">..</ol> followed by <div class="btn-row"><button data-steps>..</button></div>
  document.querySelectorAll("[data-steps]").forEach(btn => {
    const ex = btn.closest(".example") || btn.closest(".card") || document;
    const steps = [...ex.querySelectorAll(".steps li")];
    const allBtn = ex.querySelector("[data-steps-all]");
    const update = () => {
      const left = steps.filter(s => !s.classList.contains("shown")).length;
      btn.textContent = left ? `Show step ${steps.length - left + 1} of ${steps.length}` : "All steps shown";
      btn.disabled = !left;
      if (allBtn) allBtn.disabled = !left;
    };
    btn.addEventListener("click", () => {
      const nxt = steps.find(s => !s.classList.contains("shown"));
      if (nxt) nxt.classList.add("shown");
      update();
    });
    if (allBtn) allBtn.addEventListener("click", () => { steps.forEach(s => s.classList.add("shown")); update(); });
    update();
  });

  // numeric checks:
  // <div class="num-check" data-answer="-426" data-tol="0.02" data-unit="J"> <input> <button>Check</button> <span class="result"></span></div>
  document.querySelectorAll(".num-check").forEach(bindNumCheck);
})();

function bindNumCheck(nc) {
  const input = nc.querySelector("input");
  const btn = nc.querySelector("button");
  const res = nc.querySelector(".result");
  const check = () => {
    const ans = Number(nc.dataset.answer);
    const tol = Number(nc.dataset.tol || 0.02);
    const v = Number(String(input.value).replace(/[, ]/g, "").replace("−", "-"));
    if (input.value.trim() === "" || Number.isNaN(v)) { res.textContent = "Enter a number."; res.className = "result bad"; return; }
    const ok = ans === 0 ? Math.abs(v) < 1e-9 + tol : Math.abs(v - ans) <= Math.abs(ans) * tol;
    if (ok) { res.textContent = "✅ Correct!"; res.className = "result good"; }
    else if (Math.abs(v + ans) <= Math.abs(ans) * tol && ans !== 0) { res.textContent = "Check your sign! The magnitude is right."; res.className = "result bad"; }
    else { res.textContent = "❌ Try again" + (nc.dataset.hint ? " — " + nc.dataset.hint : "."); res.className = "result bad"; }
  };
  btn.addEventListener("click", check);
  input.addEventListener("keydown", e => { if (e.key === "Enter") check(); });
}

/* small helpers shared by widgets */
const fmt = (x, d = 0) => {
  if (Math.abs(x) < 0.5 * Math.pow(10, -d)) x = 0; // avoid "−0"
  const s = Number(x).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
  return s.replace("-", "−");
};
const signed = (x, d = 0) => (x >= 0.5 * Math.pow(10, -d) ? "+" : "") + fmt(x, d);
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
