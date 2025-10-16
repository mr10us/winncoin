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
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const formatWithCommas = (n) => String(n).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");

  /* ---------- Счётчик RollingNum ---------- */
  function RollingNum(container, number, type = "slide", speed = 100) {
    const spd = Number(speed) || 100;

    // Если пользователь против анимаций — просто вставим число
    if (prefersReduced) {
      container.textContent = formatWithCommas(number);
      return;
    }

    const delay = 300;
    const digits = formatWithCommas(number).split("");
    const slideStyle = "transition: margin .3s";

    // Разовая сборка HTML
    container.innerHTML += digits
      .map((ch, i) => {
        const classId = ch === "," ? `num-idx-${i}-point` : `num-idx-${i}-${ch}`;
        return `<span class="num ${classId}" data-text="${ch}">
          <span class="num-list" style="${type === "slide" ? slideStyle : ""}">0 1 2 3 4 5 6 7 8 9 ,</span>
        </span>`;
      })
      .join("");

    // Старт анимаций с лесенкой
    digits.forEach((ch, i) => {
      const selector = ch === "," ? `.num-idx-${i}-point` : `.num-idx-${i}-${ch}`;
      setTimeout(() => numAnimate(selector), delay * i);
    });

    function numAnimate(selector) {
      const numEl = container.querySelector(selector);
      if (!numEl) return;
      const numList = numEl.querySelector(".num-list");
      const dataText = numEl.getAttribute("data-text");
      const pos = dataText === "," ? 10 : +dataText;

      let n = 0;
      const id = setInterval(() => {
        numList.style.marginTop = `-${n * 30}px`;
        if (n >= 10) {
          clearInterval(id);
          numList.style.marginTop = `-${pos * 30}px`;
        }
        n++;
      }, spd);
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


