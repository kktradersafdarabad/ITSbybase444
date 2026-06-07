// Service Worker for Driver Portal PWA
const CACHE_NAME = "its-driver-v1";
const STATIC_ASSETS = ["/", "/src/main.jsx"];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/"])).catch(() => {})
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  // Network first, fallback to cache for navigation requests
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }
  // For API calls, always network
  if (e.request.url.includes("/api/") || e.request.url.includes("base44")) {
    return;
  }
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});

// Push notification handler
self.addEventListener("push", (e) => {
  const data = e.data ? e.data.json() : { title: "New Job Alert", body: "You have a new booking assigned." };
  e.waitUntil(
    self.registration.showNotification(data.title || "Driver App", {
      body: data.body || "",
      icon: "/logo192.png",
      badge: "/logo192.png",
      tag: data.tag || "driver-notification",
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = e.notification.data?.url || "/";
      for (const client of clientList) {
        if (client.url === url && "focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
