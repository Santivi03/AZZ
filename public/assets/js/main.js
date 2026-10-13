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

// Reproductor: muestra el vivo actual o el último programa (según /api/live)
// y carga YouTube recién cuando la persona toca play.
const player = document.querySelector("[data-yt-channel]");
if (player) {
  const img = player.querySelector("img");
  const btn = player.querySelector(".player-btn");
  const badge = player.querySelector(".live-badge");
  const title = player.querySelector(".player-title");
  const note = document.querySelector(".player-note");
  const liveLinks = document.querySelectorAll("[data-live-link]");
  let videoId = null;
  let started = false;

  const apply = (data) => {
    if (!data || !data.videoId) return;
    const isLive = data.status === "live";
    if (data.videoId !== videoId) {
      img.src = data.thumb;
      img.alt = `Miniatura de: ${data.title}`;
    }
    videoId = data.videoId;
    badge.hidden = !isLive;
    title.textContent = data.title;
    btn.setAttribute("aria-label", `${isLive ? "Ver en vivo" : "Ver el programa"}: ${data.title}`);
    note.textContent = {
      live: "Estamos en vivo ahora. Tocá play para verlo acá.",
      latest: "Ahora no estamos en vivo. Te dejamos el último programa.",
    }[data.status] || "El último programa del canal.";
    liveLinks.forEach((a) => { a.href = isLive ? data.watchUrl : data.channelUrl; });
    showNext(isLive ? null : data.next);
  };

  // Próximo vivo programado (solo cuando no estamos al aire)
  const nextBox = document.querySelector(".next-live");
  const tz = "America/Argentina/Buenos_Aires";
  const dayKey = (d) => d.toLocaleDateString("en-CA", { timeZone: tz });
  const whenText = (iso) => {
    const d = new Date(iso);
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 864e5);
    const hour = d.toLocaleTimeString("es-AR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
    let day;
    if (dayKey(d) === dayKey(now)) day = "hoy";
    else if (dayKey(d) === dayKey(tomorrow)) day = "mañana";
    else day = d.toLocaleDateString("es-AR", { timeZone: tz, weekday: "long", day: "numeric", month: "numeric" });
    return d <= now ? "está por empezar" : `${day} ${hour} h`;
  };
  const showNext = (next) => {
    if (!nextBox) return;
    if (!next) { nextBox.hidden = true; return; }
    nextBox.href = next.watchUrl;
    nextBox.querySelector(".next-when").textContent = whenText(next.start);
    nextBox.querySelector(".next-title").textContent = next.title;
    nextBox.setAttribute("aria-label", `Próximo vivo, ${whenText(next.start)}: ${next.title}. Activar recordatorio en YouTube`);
    nextBox.hidden = false;
  };

  const refresh = async () => {
    if (started || document.hidden) return;
    try {
      const res = await fetch("/api/live", { headers: { Accept: "application/json" } });
      if (res.ok) apply(await res.json());
    } catch {
      // Sin respuesta: queda la imagen y el texto de respaldo.
    }
  };
  refresh();
  setInterval(refresh, 120000);
  document.addEventListener("visibilitychange", refresh);

  btn.addEventListener("click", () => {
    started = true;
    const iframe = document.createElement("iframe");
    iframe.src = videoId
      ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`
      : `https://www.youtube.com/embed/live_stream?channel=${player.dataset.ytChannel}&autoplay=1`;
    iframe.title = title.textContent || "Transmisión de AZZ en YouTube";
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
  // Al volver de la pestaña del sponsor, la franja retoma sí o sí
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) { clearTimeout(holdTimer); sponsorView.classList.remove("is-holding"); }
  });
  ["pointerup", "pointercancel"].forEach((type) =>
    sponsorView.addEventListener(type, () => {
      clearTimeout(holdTimer);
      holdTimer = setTimeout(() => sponsorView.classList.remove("is-holding"), 2000);
    })
  );
}
