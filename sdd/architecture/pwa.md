# PWA Architecture — FIRST Assist

This document details Progressive Web Application behaviors of FIRST Assist.

## manifest.json
Located in [public/manifest.json](file:///home/gabriela/Documents/codes/first-assist/frontend/public/manifest.json):
* **display**: `standalone` (removes browser URL bar, giving it an app-like feel).
* **theme_color**: `#1F3A52` (Dark Navy header matching).
* **background_color**: `#F7F6F0` (Cream).
* **icons**: Lists sizes `192x192` and `512x512`.

---

## Service Worker Caching (`sw.js`)
The service worker uses a **Cache-First** strategy for static layout files to guarantee speed inside offline/low-signal FRC venues:

```javascript
const CACHE_NAME = 'first-assist-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];
```

* **Install**: Populates `CACHE_NAME` with assets.
* **Fetch**: Intercepts requests. Returns cache if hit, otherwise fetches from network.
* **Activate**: Flushes legacy cache names.

---

## Offline Support Classifications

* **Required**: Core interface assets (HTML, CSS, JS assets) must load instantly.
* **Optional**: Local persistence of newly reported incidents during connectivity dropouts.
* **Not Supported**: Real-time synchronization of other users' updates while disconnected.
* **Future Work**: Implementing IndexedDB to store pending offline reports, sync-queueing, and automatic backgrounds synchronization once the device rejoins the internet.
