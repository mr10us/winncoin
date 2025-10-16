function RollingNum(el, number, type, speed = 100) {
  const delay = 300;
  const num = number.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",").split("");
  num.forEach((item, i) => {
    const classId = item == "," ? `num-idx-${i}-point` : `num-idx-${i}-${item}`;
    const text = item;
    const slideStyle = "transition: margin .3s";
    el.innerHTML += `<span class="num ${classId}" data-text="${text}">
                <span class="num-list" style="${
                  type == "slide" ? slideStyle : ""
                }">0 1 2 3 4 5 6 7 8 9 ,</span>
            </span>`;

    setTimeout(() => {
      numAnimate(`.${classId}`);
    }, delay * i);
  });

  function numAnimate(unit) {
    const element = el.querySelector(unit);
    const numList = element.querySelector(".num-list");
    const dataText = element.getAttribute("data-text");
    const pos = dataText == "," ? 10 : dataText;
    let n = 0;
    const numInterval = setInterval(() => {
      numList.style.marginTop = `-${n * 30}px`;
      if (n >= 10) {
        clearInterval(numInterval);
        numList.style.marginTop = `-${pos * 30}px`;
      }
      n++;
    }, speed);
  }
}

const toEnroll = document.querySelectorAll('*[data-anim="enroll"]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(
    (entry) => {
      if (entry.isIntersecting) {
        RollingNum(
          entry.target,
          entry.target.getAttribute("data-num"),
          "slide",
          entry.target.getAttribute("data-speed")
        );
      }
    },
    {
      root: null,
      rootMargin: "0px 0px -10% 0px", // запускаем чуть раньше, чтобы не было "рывка"
      threshold: 0.12,
    }
  );
});

toEnroll.forEach((item) => {
  observer.observe(item);
});

console.log(toEnroll);
