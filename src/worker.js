// AZZ: sirve el sitio estático y dos rutas de API.
//   GET /api/live           -> estado del canal (en vivo o último programa)
//   GET /api/thumb/<id>     -> miniatura de YouTube servida desde este dominio,
//                              así el visitante no le manda su IP a Google.
//
// Datos: feeds RSS públicos del canal (gratis, sin clave). Si existe el secreto
// YT_API_KEY, se consulta además la YouTube Data API (videos.list, 1 unidad por
// consulta) para saber si hay una transmisión activa en este momento.

const CHANNEL_ID = "UCgLBmUFPO8JtZ1nPIBQGMlQ";
const CHANNEL_URL = `https://www.youtube.com/channel/${CHANNEL_ID}`;
const FEED_LIVES = `https://www.youtube.com/feeds/videos.xml?playlist_id=UULV${CHANNEL_ID.slice(2)}`;
const LIVE_TTL = 60; // segundos entre consultas a YouTube
const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;

// Caché en memoria del isolate. En un dominio propio también se usa caches.default.
let memo = { at: 0, data: null };

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/api/live") return live(request, env, ctx);

    const thumb = url.pathname.match(/^\/api\/thumb\/([A-Za-z0-9_-]{11})$/);
    if (thumb) return thumbnail(request, thumb[1], url.searchParams.has("live"), ctx);

    if (url.pathname.startsWith("/api/")) return json({ error: "No existe" }, 404, 0);

    return env.ASSETS.fetch(request);
  },
};

async function live(request, env, ctx) {
  const now = Date.now();
  if (memo.data && now - memo.at < LIVE_TTL * 1000) return json(memo.data, 200, LIVE_TTL);

  const cache = caches.default;
  const key = new Request(new URL("/api/live", request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  let data;
  try {
    data = await resolveStatus(env);
  } catch {
    // Si YouTube falla, la portada se queda con su imagen de respaldo.
    data = { status: "unknown", channelUrl: CHANNEL_URL };
  }
  memo = { at: now, data };

  const res = json(data, 200, LIVE_TTL);
  ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}

async function resolveStatus(env) {
  const entries = await readFeed(FEED_LIVES);
  if (!entries.length) return { status: "unknown", channelUrl: CHANNEL_URL };

  // Sin clave no sabemos si está al aire: "recent" no afirma ni niega el vivo.
  if (!env.YT_API_KEY) return asVideo("recent", entries[0], false);

  const ids = entries.slice(0, 8).map((e) => e.id).join(",");
  const api = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${env.YT_API_KEY}`;
  const res = await fetch(api, { cf: { cacheTtl: 0 } });
  if (!res.ok) return asVideo("recent", entries[0], false);

  const items = (await res.json()).items || [];
  const onAir = items.find((v) => v.snippet?.liveBroadcastContent === "live");
  if (onAir) return asVideo("live", { id: onAir.id, title: onAir.snippet.title }, true);

  const done = items.find((v) => v.snippet?.liveBroadcastContent === "none");
  const pick = done ? { id: done.id, title: done.snippet.title } : entries[0];
  return asVideo("latest", pick, false);
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

async function readFeed(feedUrl) {
  const res = await fetch(feedUrl, { cf: { cacheTtl: 0 } });
  if (!res.ok) return [];
  const xml = await res.text();
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
