window.addEventListener("DOMContentLoaded", () => {
  const acc = document.querySelectorAll(".accordion");

  if (!acc || acc.length === 0) return;

  loadCSS();

  let activeAccordion = null;

  acc.forEach((item) => {
    item.addEventListener("click", function () {
      if (activeAccordion && activeAccordion !== this) {
        activeAccordion.classList.remove("active");
        activeAccordion.nextElementSibling.style.maxHeight = null;
      }

      this.classList.toggle("active");
      // activeAccordion = this;

      const panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });
});

const css = '.accordion,.panel{background-color:transparent}ul:has(li > .accordion){display:grid;grid-template-columns:100%}.accordion{display:grid;grid-template-columns:auto 36px;align-items:center;gap:1rem;cursor:pointer;padding-top:4rem;padding-bottom:4rem;width:100%;text-align:left;border:none;transition:.4s,padding .1s}.accordion svg{width:24px;min-width:24px;transition:transform .3s}.accordion.active svg{transform:rotate(-45deg)}.accordion.active{background-color:hsl(from var(--color-white) h s calc(l - 2));border-bottom-left-radius:0;border-bottom-right-radius:0;padding-bottom:1rem;color:var(--color-black)}.accordion.active+.panel{margin-bottom:4rem;text-align:justify}.panel{font-size:var(--text-md);color:var(--text-heading-secondary);max-height:0;overflow:hidden;transition:.2s ease-out,margin .1s .1s}.panel>:first-child{margin-top:1.5rem}.panel>:last-child{margin-bottom:10px}.panel h1,.panel h2,.panel h3,.panel h4,.panel h5,.panel h6{color:var(--color-primary);margin-top:1.5rem;margin-bottom:1rem}.panel blockquote,.panel img,.panel ol,.panel p,.panel table,.panel ul{margin-bottom:1.5rem}.panel a{color:var(--color-secondary);text-decoration:underline;transition:.3s}@media (hover:hover){.panel a:hover{color:var(--color-primary)}}.panel ol,.panel ul{list-style-type:disc;padding-left:2rem}.panel ol li,.panel ul li{margin-bottom:.5rem}.panel blockquote{padding:1rem;border-left:4px solid var(--color-primary);background-color:var(--bg-secondary)}.panel img{max-width:100%;height:auto}.panel table{width:100%;border-collapse:collapse}.panel iframe{width:100%}.panel td,.panel th{padding:.75rem;border:1px solid var(--color-gray)}';

function loadCSS() {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);
}
