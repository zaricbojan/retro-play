/*! Minimaler Cross-Origin-Isolation-Service-Worker (nach dem Muster von coi-serviceworker).
   GitHub Pages kann keine COOP/COEP-Header setzen; dieser Worker ergänzt sie clientseitig,
   damit SharedArrayBuffer (Threads) für Cores wie PSP funktioniert. */
if (typeof window === "undefined") {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
  self.addEventListener("fetch", e => {
    const r = e.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") return;
    e.respondWith(
      fetch(r).then(res => {
        if (res.status === 0) return res;
        const h = new Headers(res.headers);
        h.set("Cross-Origin-Embedder-Policy", "credentialless");
        h.set("Cross-Origin-Opener-Policy", "same-origin");
        return new Response(res.body, { status: res.status, statusText: res.statusText, headers: h });
      }).catch(err => { console.error(err); throw err; })
    );
  });
} else {
  (async () => {
    if (window.crossOriginIsolated !== false) return;
    if (!("serviceWorker" in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register(window.document.currentScript.src);
      reg.addEventListener("updatefound", () => location.reload());
      if (reg.active && !navigator.serviceWorker.controller) location.reload();
    } catch (e) { console.error("COI service worker failed:", e); }
  })();
}
