const CACHE_NAME = 'personal-assistant-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// 安装时缓存资源
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => {
        console.error('Service Worker install: cache.addAll failed:', err);
        throw err;
      })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).catch(err => {
      console.error('Service Worker activate: cache cleanup failed:', err);
    })
  );
  self.clients.claim();
});

// 拦截请求，优先从缓存获取
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中，直接返回
        if (response) {
          return response;
        }
        // 否则发起网络请求
        return fetch(event.request)
          .then(response => {
            // 缓存新请求
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache))
              .catch(err => {
                console.error('Service Worker: cache.put failed:', err);
              });
            return response;
          });
      })
      .catch(err => {
        console.error('Service Worker fetch failed:', err);
        // 网络和缓存都不可用时返回离线提示
        if (event.request.destination === 'document') {
          return new Response(
            '<h1>离线不可用</h1><p>请检查网络连接后重试。</p>',
            { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
          );
        }
      })
  );
});
