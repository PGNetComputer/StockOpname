/* Service worker sederhana: aplikasi bisa dipasang di layar HP & tetap
 * terbuka walau sinyal lemah. Halaman selalu coba ambil versi terbaru dulu
 * (network-first), cadangannya salinan terakhir. Panggilan ke Apps Script
 * TIDAK pernah disimpan (selalu langsung ke server). */
var CACHE = 'stok-opname-v1';
var FILES = ['./', './index.html', './config.js', './api.js', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return; // API Apps Script: lewati
  e.respondWith(
    fetch(e.request).then(function (res) {
      var salin = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, salin); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (r) { return r || caches.match('./index.html'); });
    })
  );
});
