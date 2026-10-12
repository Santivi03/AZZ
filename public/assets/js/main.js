// Header: borde al hacer scroll
const header = document.querySelector(".site-header");
if (header) {
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

// Menú en celular
const menuBtn = document.querySelector(".menu-btn");
const menu = document.getElementById("menu-movil");
if (menuBtn && menu) {
  const setOpen = (open) => {
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    menu.hidden = !open;
  };
  menuBtn.addEventListener("click", () => setOpen(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) { setOpen(false); menuBtn.focus(); }
  });
}

// Reproductor: YouTube se carga recién cuando la persona toca play
const player = document.querySelector("[data-yt-channel]");
if (player) {
  player.querySelector(".player-btn").addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube.com/embed/live_stream?channel=${player.dataset.ytChannel}&autoplay=1`;
    iframe.title = "Transmisión de AZZ en YouTube";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    player.replaceChildren(iframe);
    iframe.focus();
  });
}

// Copiar alias
const copyBtn = document.querySelector("[data-copy]");
if (copyBtn) {
  const status = document.querySelector(".copy-status");
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.copy);
      status.textContent = "Alias copiado";
    } catch {
      status.textContent = `No se pudo copiar. El alias es ${copyBtn.dataset.copy}`;
    }
  });
}

// Año del footer
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

// Sponsors: franja continua. Con "reducir movimiento" queda la fila deslizable.
const sponsorView = document.querySelector(".sponsor-viewport");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
if (sponsorView && !reduceMotion) {
  const row = sponsorView.querySelector(".sponsor-row");
  const items = [...row.children];
  items.forEach((li) => {
    const copy = li.cloneNode(true);
    copy.setAttribute("aria-hidden", "true");
    copy.querySelectorAll("a").forEach((a) => a.setAttribute("tabindex", "-1"));
    row.append(copy);
  });
  // ~40px por segundo, sin importar cuántos sponsors haya
  row.style.setProperty("--marquee-dur", `${Math.max(items.length * 5.5, 20)}s`);
  sponsorView.classList.add("is-marquee");
  sponsorView.closest(".sponsors").classList.add("has-marquee");

  // En celular se frena mientras el dedo está apoyado
  let holdTimer;
  sponsorView.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    clearTimeout(holdTimer);
    sponsorView.classList.add("is-holding");
  });
  ["pointerup", "pointercancel"].forEach((type) =>
    sponsorView.addEventListener(type, () => {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => sponsorView.classList.remove("is-holding"), 2000);
    })
  );
}
