window.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    await ensureSwiper();
    initialiseSliders();
  } catch (e) {
    console.error("Swiper load failed:", e);
  } finally {
  }
}

/* ===== Надёжная загрузка Swiper ===== */
async function ensureSwiper() {
  if (window.Swiper) return;

  // если на странице уже есть тег со swiper — просто подождём глобал
  const existing = document.querySelector("script[src*='swiper']");
  if (existing) {
    await waitForGlobal(() => window.Swiper, 5000);
    if (window.Swiper) return;
  }

  // Список источников: локальный, затем CDN bundle
  const sources = [
    {
      css: "https://skeltra.agency/wp-content/themes/tskeltra/assets/css/swiper.min.css",
      js: "https://skeltra.agency/wp-content/themes/tskeltra/assets/js/swiper.min.js",
      note: "local",
    },
    {
      css: "https://unpkg.com/swiper@11/swiper-bundle.min.css",
      js: "https://unpkg.com/swiper@11/swiper-bundle.min.js",
      note: "cdn",
    },
  ];

  for (const src of sources) {
    try {
      await addCSSOnce(src.css);
      const ok = await loadScriptUntilGlobal(src.js, () => window.Swiper, 5000);
      if (ok && window.Swiper) return; // успех
    } catch (e) {
      console.warn("[swiper] try failed:", src.note, e);
      // пробуем следующий источник
    }
  }
  throw new Error("Unable to load Swiper from all sources");
}

function addCSSOnce(href) {
  return new Promise((resolve) => {
    if ([...document.styleSheets].some((s) => s.href && s.href.includes(href)))
      return resolve();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => resolve(); // не блокируем цепочку
    document.head.appendChild(link);
  });
}

/**
 * Подгружаем <script>, но РАСЧИТЫВАЕМ не на onload,
 * а на появление глобала (window.Swiper) или таймаут.
 */
function loadScriptUntilGlobal(src, globalCheck, timeout = 5000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const script = document.createElement("script");
    script.src = src;
    script.type = "text/javascript";

    const cleanup = () => {
      script.onload = script.onerror = null;
    };

    const t = setTimeout(() => {
      if (done) return;
      done = true;
      cleanup();
      resolve(false); // таймаут — считаем попытку неудачной
    }, timeout);

    // Если вдруг onload пришёл — ок, но всё равно проверим глобал
    script.onload = () => {
      if (done) return;
      // не завершаем сразу — ждём глобал параллельно (ниже)
    };
    script.onerror = () => {
      if (done) return;
      done = true;
      cleanup();
      clearTimeout(t);
      resolve(false); // ошибка — двигаемся к следующему источнику
    };

    document.head.appendChild(script);

    // Параллельно опрашиваем наличие глобала
    pollForGlobal(globalCheck, timeout).then((has) => {
      if (done) return;
      done = true;
      cleanup();
      clearTimeout(t);
      resolve(!!has);
    });
  });
}

function pollForGlobal(check, timeout = 5000, interval = 50) {
  return new Promise((resolve) => {
    const start = Date.now();
    (function tick() {
      try {
        if (check()) return resolve(true);
      } catch {}
      if (Date.now() - start > timeout) return resolve(false);
      setTimeout(tick, interval);
    })();
  });
}

function waitForGlobal(check, timeout = 5000, interval = 50) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    (function tick() {
      try {
        if (check()) return resolve();
      } catch {}
      if (Date.now() - start > timeout)
        return reject(new Error("waitFor timeout"));
      setTimeout(tick, interval);
    })();
  });
}

function initialiseSliders() {
  const marquee = new Swiper(".marquee-swiper", {
    slidesPerView: "auto",
    spaceBetween: 25,
    loop: true,
    speed: 4000,
    allowTouchMove: false,
    autoplay: {
      delay: 1,
      disableOnInteraction: false,
    },
  });

  const teamSwiper = new Swiper(".team-swiper", {
    slidesPerView: "auto",
    slidesPerGroup: 2,
    spaceBetween: 16,
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 2,
      },
      1024: {
        slidesPerView: 3,
        slidesPerView: 3
      },
    },
  })
}


// Drag scroll для секции PATH
(function () {
  function enableDragScroll(el) {
    let isDown = false;
    let startX = 0;
    let startLeft = 0;
    let moved = false;

    el.addEventListener('pointerdown', (e) => {
      isDown = true;
      moved = false;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      el.classList.add('dragging');
      el.setPointerCapture?.(e.pointerId);
    });

    el.addEventListener('pointermove', (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 3) moved = true;            // порог, чтобы клик не срабатывал
      el.scrollLeft = startLeft - dx;                // тащим контент
    });

    function endDrag(e) {
      isDown = false;
      el.classList.remove('dragging');
      try { el.releasePointerCapture?.(e.pointerId); } catch {}
    }
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
    el.addEventListener('pointerleave', (e) => isDown && endDrag(e));

    // если перетаскивали — отменим клик по ссылкам внутри
    el.addEventListener('click', (e) => {
      if (moved) e.preventDefault();
    }, true);
  }

  document.querySelectorAll('.drag-scroll').forEach(enableDragScroll);
})();
