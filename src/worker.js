// AZZ: sirve el sitio estático (la portada sale ya armada con el vivo) y dos rutas de API.
//   GET /api/live           -> estado del canal (en vivo o último programa)
//   GET /api/thumb/<id>     -> miniatura de YouTube servida desde este dominio,
//                              así el visitante no le manda su IP a Google.
//
// Datos: con el secreto YT_API_KEY se usa la YouTube Data API (playlistItems +
// videos.list, 2 unidades por consulta) para saber si hay un vivo activo y cuál
// es el próximo. Sin clave, o si la API falla, se usa el feed RSS público.
// Si todo falla, se sirve el último dato bueno.

const CHANNEL_ID = "UCgLBmUFPO8JtZ1nPIBQGMlQ";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;
const FEED_LIVES = `https://www.youtube.com/feeds/videos.xml?playlist_id=UULV${CHANNEL_ID.slice(2)}`;
const LIVE_TTL = 60; // segundos entre consultas a YouTube
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

// Caché en memoria del isolate. En un dominio propio también se usa caches.default.
let memo = { at: 0, data: null };
let lastGood = { at: 0, data: null };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/live") return live(request, env, ctx);

    const thumb = url.pathname.match(/^\/api\/thumb\/([A-Za-z0-9_-]{11})$/);
    if (thumb) return thumbnail(request, thumb[1], url.searchParams.has("live"), ctx);

    if (url.pathname.startsWith("/api/")) return json({ error: "No existe" }, 404, 0);

    if (url.pathname === "/" || url.pathname === "/index.html") return homePage(request, env, ctx);

    return env.ASSETS.fetch(request);
  },
};

async function live(request, env, ctx) {
  return json(await getLiveData(request, env, ctx), 200, LIVE_TTL);
}

// Estado del canal con caché: memoria del isolate, caches.default (en dominio propio)
// y, si YouTube falla, el último dato bueno de las últimas 6 horas.
async function getLiveData(request, env, ctx) {
  const now = Date.now();
  if (memo.data && now - memo.at < LIVE_TTL * 1000) return memo.data;

  const cache = caches.default;
  const key = new Request(new URL("/api/live", request.url).toString());
  const hit = await cache.match(key);
  if (hit) {
    const cached = await hit.json();
    memo = { at: now, data: cached };
    return cached;
  }

  let data;
  try {
    data = await resolveStatus(env);
  } catch {
    data = { status: "unknown", channelUrl: CHANNEL_URL };
  }
  if (data.status === "unknown" && lastGood.data && now - lastGood.at < 6 * 3600 * 1000) {
    data = lastGood.data;
  } else if (data.status !== "unknown") {
    lastGood = { at: now, data };
  }
  memo = { at: now, data };
  ctx.waitUntil(cache.put(key, json(data, 200, LIVE_TTL)));
  return data;
}

// Portada: antes de mandar index.html le pone el vivo o el último programa,
// así la primera imagen que se ve ya es la correcta (sin el salto desde la de respaldo).
async function homePage(request, env, ctx) {
  const page = await env.ASSETS.fetch(request);
  const type = page.headers.get("Content-Type") || "";
  if (!page.ok || !type.includes("text/html")) return page;

  let data;
  try {
    data = await getLiveData(request, env, ctx);
  } catch {
    return page;
  }
  if (!data || !data.videoId) return page;

  const isLive = data.status === "live";
  const note = {
    live: "Estamos en vivo ahora. Tocá play para verlo acá.",
    latest: "Ahora no estamos en vivo. Te dejamos el último programa.",
  }[data.status] || "El último programa del canal.";
  const next = !isLive && data.next ? data.next : null;

  const rewritten = new HTMLRewriter()
    .on(".player", { element: (el) => el.setAttribute("data-video-id", data.videoId) })
    .on(".player img", {
      element: (el) => {
        el.setAttribute("src", data.thumb);
        el.setAttribute("alt", `Miniatura de: ${data.title}`);
      },
    })
    .on(".live-badge", { element: (el) => { if (isLive) el.removeAttribute("hidden"); } })
    .on(".player-title", { element: (el) => el.setInnerContent(data.title) })
    .on(".player-btn", {
      element: (el) => el.setAttribute("aria-label", `${isLive ? "Ver en vivo" : "Ver el programa"}: ${data.title}`),
    })
    .on(".player-note", { element: (el) => el.setInnerContent(note) })
    .on("[data-live-link]", { element: (el) => el.setAttribute("href", isLive ? data.watchUrl : data.channelUrl) })
    .on(".next-live", {
      element: (el) => {
        if (!next) return;
        el.removeAttribute("hidden");
        el.setAttribute("href", next.watchUrl);
        el.setAttribute("aria-label", `Próximo vivo, ${whenText(next.start)}: ${next.title}. Activar recordatorio en YouTube`);
      },
    })
    .on(".next-when", { element: (el) => { if (next) el.setInnerContent(whenText(next.start)); } })
    .on(".next-title", { element: (el) => { if (next) el.setInnerContent(next.title); } })
    .transform(page);

  const headers = new Headers(rewritten.headers);
  headers.set("Cache-Control", "no-cache");
  return new Response(rewritten.body, { status: rewritten.status, headers });
}

// Mismo formato que el navegador: "hoy 22:00 h", "mañana 21:00 h", "jueves 16/10 20:00 h"
function whenText(iso) {
  const tz = "America/Argentina/Buenos_Aires";
  const d = new Date(iso);
  const now = new Date();
  const dayKey = (x) => x.toLocaleDateString("en-CA", { timeZone: tz });
  const hour = d.toLocaleTimeString("es-AR", { timeZone: tz, hour: "2-digit", minute: "2-digit", hour12: false });
  if (d <= now) return "está por empezar";
  if (dayKey(d) === dayKey(now)) return `hoy ${hour} h`;
  if (dayKey(d) === dayKey(new Date(now.getTime() + 864e5))) return `mañana ${hour} h`;
  const day = d.toLocaleDateString("es-AR", { timeZone: tz, weekday: "long", day: "numeric", month: "numeric" });
  return `${day} ${hour} h`;
}

async function resolveStatus(env) {
  // Con clave, la lista de vivos sale de la API (1 unidad); el feed RSS público
  // queda de respaldo porque a veces YouTube lo devuelve con error 404.
  let entries = env.YT_API_KEY ? await readPlaylistApi(env.YT_API_KEY) : [];
  if (!entries.length) entries = await readFeed(FEED_LIVES);
  if (!entries.length) return { status: "unknown", channelUrl: CHANNEL_URL };

  // Sin clave no sabemos si está al aire: "recent" no afirma ni niega el vivo.
  if (!env.YT_API_KEY) return asVideo("recent", entries[0], false);

  const ids = entries.slice(0, 8).map((e) => e.id).join(",");
  const api = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${ids}&key=${env.YT_API_KEY}`;
  const res = await fetch(api, { cf: { cacheTtl: 0 } });
  if (!res.ok) return asVideo("recent", entries[0], false);

  const items = (await res.json()).items || [];
  const onAir = items.find((v) => v.snippet?.liveBroadcastContent === "live");
  if (onAir) return asVideo("live", { id: onAir.id, title: onAir.snippet.title }, true);

  const done = items.find((v) => v.snippet?.liveBroadcastContent === "none");
  const pick = done ? { id: done.id, title: done.snippet.title } : entries[0];
  return { ...asVideo("latest", pick, false), next: nextScheduled(items) };
}

// Próximo vivo programado: el más cercano que empiece desde hace 30 minutos
// en adelante (los que quedaron programados y nunca arrancaron se descartan).
function nextScheduled(items) {
  const from = Date.now() - 30 * 60 * 1000;
  const next = items
    .filter((v) => v.snippet?.liveBroadcastContent === "upcoming")
    .map((v) => ({ v, start: Date.parse(v.liveStreamingDetails?.scheduledStartTime || "") }))
    .filter((x) => x.start >= from)
    .sort((a, b) => a.start - b.start)[0];
  if (!next) return null;
  return {
    videoId: next.v.id,
    title: next.v.snippet.title,
    start: new Date(next.start).toISOString(),
    watchUrl: `https://www.youtube.com/watch?v=${next.v.id}`,
  };
}

function asVideo(status, entry, isLive) {
  return {
    status,
    videoId: entry.id,
    title: entry.title,
    watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
    thumb: `/api/thumb/${entry.id}${isLive ? "?live" : ""}`,
    channelUrl: CHANNEL_URL,
  };
}

async function readPlaylistApi(key) {
  try {
    const api = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=8&playlistId=UULV${CHANNEL_ID.slice(2)}&key=${key}`;
    const res = await fetch(api, { cf: { cacheTtl: 0 } });
    if (!res.ok) return [];
    const items = (await res.json()).items || [];
    return items
      .map((i) => ({ id: i.snippet?.resourceId?.videoId, title: i.snippet?.title || "" }))
      .filter((e) => e.id && VIDEO_ID.test(e.id));
  } catch {
    return [];
  }
}

async function readFeed(feedUrl) {
  let xml;
  try {
    const res = await fetch(feedUrl, { cf: { cacheTtl: 0 } });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }
  return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    .map((m) => ({
      id: m[1].match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1],
      title: decodeXml(m[1].match(/<title>([^<]*)<\/title>/)?.[1] || ""),
    }))
    .filter((e) => e.id && VIDEO_ID.test(e.id));
}

async function thumbnail(request, id, isLive, ctx) {
  const cache = caches.default;
  const key = new Request(request.url);
  const hit = await cache.match(key);
  if (hit) return hit;

  const names = isLive
    ? ["maxresdefault_live.jpg", "hqdefault_live.jpg", "maxresdefault.jpg", "hqdefault.jpg"]
    : ["maxresdefault.jpg", "sddefault.jpg", "hqdefault.jpg"];

  for (const name of names) {
    const img = await fetch(`https://i.ytimg.com/vi/${id}/${name}`);
    if (img.ok) {
      const res = new Response(img.body, {
        headers: {
          "Content-Type": img.headers.get("Content-Type") || "image/jpeg",
          // La miniatura de un vivo cambia; la de un video terminado no.
          "Cache-Control": `public, max-age=${isLive ? 120 : 86400}`,
        },
      });
      ctx.waitUntil(cache.put(key, res.clone()));
      return res;
    }
  }
  return new Response("Sin miniatura", { status: 404 });
}

function json(data, status, maxAge) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": maxAge ? `public, max-age=${maxAge}` : "no-store",
    },
  });
}

function decodeXml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}
