/* ===== rolling + reveal (one file) ===== */
(function () {
  /* ---------- CSS для reveal-анимаций ---------- */
  function loadCSS() {
    const css =
      ".reveal{opacity:0;transform:translateY(12px);will-change:transform,opacity}" +
      "@media (prefers-reduced-motion:reduce){.reveal{opacity:1;transform:none;clip-path:none}.is-animated[data-anim],.reveal[data-anim]{transition:none!important;animation:none!important}}" +
      "@keyframes fade-up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}" +
      "@keyframes fade-in{from{opacity:0}to{opacity:1}}" +
      "@keyframes slide-in-left{from{opacity:.001;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}" +
      "@keyframes slide-in-right{from{opacity:.001;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}" +
      "@keyframes fade-scale{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}" +
      "@keyframes clip-reveal{from{opacity:.001;clip-path:inset(0 0 100% 0 round 16px)}to{opacity:1;clip-path:inset(0 0 0% 0 round 16px)}}" +
      ".is-animated[data-anim=fade-up]{animation:fade-up var(--dur) var(--ease) var(--delay) both}" +
      ".is-animated[data-anim=fade-in]{animation:fade-in var(--dur-short) var(--ease) var(--delay) both}" +
      ".is-animated[data-anim=slide-in-left]{animation:slide-in-left var(--dur) var(--ease) var(--delay) both}" +
      ".is-animated[data-anim=slide-in-right]{animation:slide-in-right var(--dur) var(--ease) var(--delay) both}" +
      ".is-animated[data-anim=fade-scale]{animation:fade-scale var(--dur) var(--ease) var(--delay) both}" +
      ".is-animated[data-anim=clip-reveal]{animation:clip-reveal var(--dur-long) var(--ease) var(--delay) both}";
    const style = document.createElement("style");
    style.type = "text/css";
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  }

  /* ---------- Утилиты ---------- */
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const formatWithCommas = (n) =>
    String(n).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

  /* ---------- Счётчик RollingNum ---------- */
  function RollingNum(
    container,
    number,
    type = "slide",
    speed = 80,
    turns = 1
  ) {
    const spd = Number(speed) || 20;
    const CHARS = "0123456789,"; // анимируем только это (включая запятую)
    const STATIC = "+-$"; // эти символы ставим сразу
    const full = CHARS.length;

    // 0) очистка контейнера + отмена прошлых таймеров
    if (container._rollingTimers) {
      container._rollingTimers.forEach(clearInterval);
    }
    container._rollingTimers = [];
    container.innerHTML = ""; // ← полная очистка

    // 1) режим «меньше анимаций»
    if (prefersReduced) {
      container.textContent = String(formatWithCommas(number));
      return;
    }

    // 2) готовим вывод
    const out = String(formatWithCommas(number));
    const digits = out.split("");

    // 3) строим разметку
    container.innerHTML = digits
      .map((ch, i) => {
        if (STATIC.includes(ch)) {
          return `<span class="num num-static">${ch}</span>`;
        }
        if (CHARS.includes(ch)) {
          return `
        <span class="num num-idx-${i}" data-text="${ch}">
          <span class="num-list">
            ${CHARS.split("")
              .map((c) => `<span>${c}</span>`)
              .join("")}
          </span>
        </span>`;
        }
        // неизвестные символы — просто как есть
        return `<span class="num num-static">${ch}</span>`;
      })
      .join("");

    // 4) запускаем анимации только для цифр и запятой
    const delayStep = 300;
    digits.forEach((ch, i) => {
      if (!CHARS.includes(ch)) return;
      setTimeout(() => animateTo(`.num-idx-${i}`), delayStep * i);
    });

    function animateTo(selector) {
      const numEl = container.querySelector(selector);
      if (!numEl) return;

      const list = numEl.querySelector(".num-list");
      const ch = numEl.getAttribute("data-text");
      const pos = CHARS.indexOf(ch); // позиция целевого символа
      const step = list.firstElementChild.getBoundingClientRect().height;
      const target = (Number(turns) || 1) * full + pos;

      let n = 0;
      const id = setInterval(() => {
        list.style.transition = type === "slide" ? "transform .3s" : "none";
        list.style.transform = `translateY(${-n * step}px)`;
        if (n >= target) {
          clearInterval(id);
          list.style.transform = `translateY(${-pos * step}px)`;
        }
        n++;
      }, spd);

      // запомним таймер, чтобы уметь отменять при повторном вызове
      container._rollingTimers.push(id);
    }
  }

  /* ---------- Инициализация: CSS + reveal-анимации ---------- */
  loadCSS();

  (function initReveal() {
    if (prefersReduced) return; // уважаем пользователей
    const els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          // 1) явная задержка
          const explicitDelay = parseFloat(el.dataset.delay ?? "NaN");
          let delay = Number.isNaN(explicitDelay) ? 0 : explicitDelay;

          // 2) stagger от родителя
          if (Number.isNaN(explicitDelay)) {
            const parent = el.closest("[data-stagger]");
            if (parent) {
              const children = [...parent.querySelectorAll(".reveal")];
              const index = Math.max(0, children.indexOf(el));
              const step = parseFloat(parent.dataset.stagger || "0.06");
              delay = index * step;
            }
          }

          el.style.setProperty("--delay", `${delay}s`);
          el.classList.add("is-animated");
          io.unobserve(el);
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  })();

  /* ---------- Инициализация: счётчики при входе в вьюпорт ---------- */
  (function initRollingOnView() {
    const targets = document.querySelectorAll('[data-anim="enroll"]');
    if (!targets.length) return;

    const enrollIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;

          // защита от повторного запуска
          if (el.dataset.rolled) {
            enrollIO.unobserve(el);
            return;
          }

          RollingNum(
            el,
            el.getAttribute("data-num") || "",
            "slide",
            el.getAttribute("data-speed")
          );

          el.dataset.rolled = "1";
          enrollIO.unobserve(el);
        });
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    targets.forEach((el) => enrollIO.observe(el));
  })();
})();
