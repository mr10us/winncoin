(() => {
  const HEADER = document.querySelector("header");
  const burger = document.getElementById("burger");
  const menu = document.getElementById("mobile-menu");

  const isOpen = () => !menu.hasAttribute("hidden");

  handleHeaderScroll(HEADER);

  function openMenu() {
    if (isOpen()) return;
    menu.removeAttribute("hidden");
    burger.classList.add("active");
    burger.setAttribute("aria-expanded", "true");

    // навешиваем только когда нужно
    document.addEventListener("pointerdown", onDocPointerDown, true);
    document.addEventListener("keydown", onDocKeydown);
  }

  function closeMenu() {
    if (!isOpen()) return;
    menu.setAttribute("hidden", "");
    burger.classList.remove("active");
    burger.setAttribute("aria-expanded", "false");

    // снимаем слушатели — ноль лишней нагрузки
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    document.removeEventListener("keydown", onDocKeydown);
  }

  function toggleMenu() {
    isOpen() ? closeMenu() : openMenu();
  }

  function onDocPointerDown(e) {
    // клик снаружи: цель не внутри меню и не по бургеру
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
      closeMenu();
    }
  }

  function onDocKeydown(e) {
    if (e.key === "Escape") closeMenu();
  }

  // бургер: и клик, и Enter/Space для доступности
  burger.addEventListener("click", toggleMenu);
  burger.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); // не прокручиваем страницу на Space
      toggleMenu();
    }
  });

  // клики по ссылкам внутри меню — закрываем
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
