(() => {
  const HEADER = document.querySelector("header");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobile-menu");

  const isOpen = () => !menu.hasAttribute("hidden");

  handleHeaderScroll(HEADER);

  /* === SCROLL-LOCK helpers === */
  let _lockScrollTop = 0;
  function getScrollbarW() {
    return window.innerWidth - document.documentElement.clientWidth;
  }
  function lockScroll() {
    if (document.documentElement.classList.contains("scroll-lock")) return;
    _lockScrollTop = window.scrollY || document.documentElement.scrollTop || 0;

    const pr = getScrollbarW();
    // компенсируем исчезнувший скроллбар
    if (pr > 0) {
      document.documentElement.style.setProperty("--sbw", pr + "px");
    }

    // iOS-safe фиксация
    document.documentElement.classList.add("scroll-lock");
  }
  function unlockScroll() {
    if (!document.documentElement.classList.contains("scroll-lock")) return;

    document.documentElement.classList.remove("scroll-lock");
    document.documentElement.style.removeProperty("--sbw");

    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";

    window.scrollTo(0, _lockScrollTop);
    _lockScrollTop = 0;
  }

  function openMenu() {
    if (isOpen()) return;
    menu.removeAttribute("hidden");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded", "true");

    lockScroll();                         // ← включаем lock

    // навешиваем только когда нужно
    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onDocKeydown);

    // опционально: фокус внутрь меню
    const firstFocusable = menu.querySelector("a,button,[tabindex]:not([tabindex='-1'])");
    firstFocusable?.focus();
  }

  function closeMenu() {
    if (!isOpen()) return;
    menu.setAttribute("hidden", "");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");

    unlockScroll();                       // ← снимаем lock

    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeydown);

    // вернём фокус на бургер для a11y
    burger.focus();
  }

  function toggleMenu() { isOpen() ? closeMenu() : openMenu(); }

  function onDocPointerDown(e) {
    if (!menu.contains(e.target) && !burger.contains(e.target)) closeMenu();
  }
  function onDocKeydown(e) {
    if (e.key === "Escape") closeMenu();
  }

  burger.addEventListener("click", toggleMenu);
  burger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleMenu(); }
  });

  menu.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (a) closeMenu();
  });
})();


function handleHeaderScroll(header) {
  if (!header) return;

  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  }

  window.addEventListener(
    "scroll",
    _throttle(() => {
      addHeaderScrolled(header);
    }, 1000)
  );
}

function addHeaderScrolled(header) {
  if (!header) return;

  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }
}

function _throttle(fn, limit) {
  let inThrottle = false,
    lastArgs = null,
    lastThis = null;
  return function (...args) {
    lastArgs = args;
    lastThis = this;
    if (!inThrottle) {
      fn.apply(lastThis, lastArgs);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        // в конце окна — если приходили вызовы, выполним последний
        if (lastArgs) fn.apply(lastThis, lastArgs);
        lastArgs = lastThis = null;
      }, limit);
    }
  };
}
