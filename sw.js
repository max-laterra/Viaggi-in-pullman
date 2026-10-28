// Rende l'app utilizzabile anche senza connessione. Il numero cambia da solo a ogni nuova versione.
const VERSION = "viaggi-laterra-1.6";
const SHELL = ["./", "./index.html", "./app.js?v=1.6", "./app.css?v=1.6", "./config.js?v=1.6", "./dropbox.js?v=1.6", "./layouts.js?v=1.6", "./vendor/jszip.min.js",
  "./vendor/pdfjs/pdf.min.mjs", "./vendor/comuni.txt", "./vendor/pdfjs/pdf.worker.min.mjs", "./logo.jpg", "./posto.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png", "./icons/favicon-64.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil((async () => { for (const k of await caches.keys()) if (k !== VERSION) await caches.delete(k); await self.clients.claim(); })()); });
const timeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error("timeout")), ms))]);
self.addEventListener("fetch", (e) => {
  const req = e.request; if (req.method !== "GET") return;
  const url = new URL(req.url);
  const same = url.origin === self.location.origin;
  const fonts = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (!same && !fonts) return; // Dropbox e WhatsApp passano sempre dalla rete
  e.respondWith((async () => {
    const c = await caches.open(VERSION);
    if (fonts) { const hit = await c.match(req); if (hit) return hit; try { const r = await fetch(req); if (r.ok || r.type === "opaque") c.put(req, r.clone()); return r; } catch (_) { return Response.error(); } }
    // "no-cache": chiede sempre al sito se il file è cambiato, così un aggiornamento su GitHub arriva subito
    try { const r = await timeout(fetch(req, { cache: "no-cache" }), 4000); if (r.ok) c.put(req, r.clone()); return r; }
    catch (_) { return (await c.match(req, { ignoreSearch: true })) || (req.mode === "navigate" ? await c.match("./index.html") : null) || Response.error(); }
  })());
});
