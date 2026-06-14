/**
 * @jest-environment node
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

/**
 * Tests for sw.js (Service Worker)
 *
 * We load sw.js in a sandboxed VM context with mocked Service Worker globals.
 */

describe('Service Worker (sw.js)', () => {
  let listeners;
  let mockCache;
  let mockCaches;
  let mockSelf;
  let swCode;

  beforeAll(() => {
    swCode = fs.readFileSync(path.join(__dirname, '..', 'sw.js'), 'utf-8');
  });

  beforeEach(() => {
    listeners = {};

    mockCache = {
      addAll: jest.fn().mockResolvedValue(undefined),
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn()
    };

    mockCaches = {
      open: jest.fn().mockResolvedValue(mockCache),
      keys: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
      match: jest.fn()
    };

    mockSelf = {
      addEventListener: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
      skipWaiting: jest.fn(),
      clients: {
        claim: jest.fn()
      }
    };

    const context = vm.createContext({
      self: mockSelf,
      caches: mockCaches,
      fetch: jest.fn(),
      Promise,
      console
    });

    vm.runInContext(swCode, context);
  });

  describe('install event', () => {
    it('registers install listener', () => {
      expect(mockSelf.addEventListener).toHaveBeenCalledWith('install', expect.any(Function));
      expect(listeners.install).toBeDefined();
    });

    it('caches required URLs on install', async () => {
      const waitUntilPromise = [];
      const event = {
        waitUntil: jest.fn((p) => waitUntilPromise.push(p))
      };

      listeners.install(event);
      expect(event.waitUntil).toHaveBeenCalled();
      await waitUntilPromise[0];

      expect(mockCaches.open).toHaveBeenCalledWith('personal-assistant-v1');
      expect(mockCache.addAll).toHaveBeenCalledWith(expect.arrayContaining([
        '/',
        '/index.html',
        '/app.js'
      ]));
    });

    it('calls skipWaiting', () => {
      const event = { waitUntil: jest.fn() };
      listeners.install(event);
      expect(mockSelf.skipWaiting).toHaveBeenCalled();
    });
  });

  describe('activate event', () => {
    it('registers activate listener', () => {
      expect(mockSelf.addEventListener).toHaveBeenCalledWith('activate', expect.any(Function));
      expect(listeners.activate).toBeDefined();
    });

    it('deletes old caches and keeps current', async () => {
      mockCaches.keys.mockResolvedValue(['personal-assistant-v1', 'old-cache-v0']);
      const waitUntilPromise = [];
      const event = {
        waitUntil: jest.fn((p) => waitUntilPromise.push(p))
      };

      listeners.activate(event);
      await waitUntilPromise[0];

      expect(mockCaches.delete).toHaveBeenCalledWith('old-cache-v0');
      expect(mockCaches.delete).not.toHaveBeenCalledWith('personal-assistant-v1');
    });

    it('calls clients.claim', () => {
      const event = { waitUntil: jest.fn() };
      listeners.activate(event);
      expect(mockSelf.clients.claim).toHaveBeenCalled();
    });

    it('does not delete anything when only current cache exists', async () => {
      mockCaches.keys.mockResolvedValue(['personal-assistant-v1']);
      const waitUntilPromise = [];
      const event = {
        waitUntil: jest.fn((p) => waitUntilPromise.push(p))
      };

      listeners.activate(event);
      await waitUntilPromise[0];

      expect(mockCaches.delete).not.toHaveBeenCalled();
    });
  });

  describe('fetch event', () => {
    it('registers fetch listener', () => {
      expect(mockSelf.addEventListener).toHaveBeenCalledWith('fetch', expect.any(Function));
      expect(listeners.fetch).toBeDefined();
    });

    it('returns cached response when available', async () => {
      const cachedResponse = { clone: jest.fn() };

      let respondedWith;
      const event = {
        request: { url: 'https://example.com/app.js' },
        respondWith: jest.fn((p) => { respondedWith = p; })
      };

      // sw.js does: caches.match(event.request).then(response => ...)
      mockCaches.match.mockResolvedValue(cachedResponse);

      listeners.fetch(event);
      const result = await respondedWith;

      expect(result).toBe(cachedResponse);
    });

    it('fetches from network when cache misses', async () => {
      const networkResponse = {
        status: 200,
        type: 'basic',
        clone: jest.fn().mockReturnValue('cloned')
      };

      mockCaches.match.mockResolvedValue(undefined);

      // We need to access the fetch mock from the VM context
      // Re-create with fetch accessible
      const mockFetch = jest.fn().mockResolvedValue(networkResponse);

      // Rebuild the context with the new fetch
      listeners = {};
      const context = vm.createContext({
        self: mockSelf,
        caches: mockCaches,
        fetch: mockFetch,
        Promise,
        console
      });
      vm.runInContext(swCode, context);

      let respondedWith;
      const event = {
        request: { url: 'https://example.com/new.js' },
        respondWith: jest.fn((p) => { respondedWith = p; })
      };

      listeners.fetch(event);
      const result = await respondedWith;

      expect(result).toBe(networkResponse);
      expect(mockFetch).toHaveBeenCalledWith(event.request);
    });

    it('does not cache non-200 responses', async () => {
      const networkResponse = {
        status: 404,
        type: 'basic',
        clone: jest.fn()
      };

      mockCaches.match.mockResolvedValue(undefined);
      const mockFetch = jest.fn().mockResolvedValue(networkResponse);

      listeners = {};
      const context = vm.createContext({
        self: mockSelf,
        caches: mockCaches,
        fetch: mockFetch,
        Promise,
        console
      });
      vm.runInContext(swCode, context);

      let respondedWith;
      const event = {
        request: { url: 'https://example.com/missing.js' },
        respondWith: jest.fn((p) => { respondedWith = p; })
      };

      listeners.fetch(event);
      await respondedWith;

      expect(mockCache.put).not.toHaveBeenCalled();
    });

    it('does not cache non-basic response types', async () => {
      const networkResponse = {
        status: 200,
        type: 'opaque',
        clone: jest.fn()
      };

      mockCaches.match.mockResolvedValue(undefined);
      const mockFetch = jest.fn().mockResolvedValue(networkResponse);

      listeners = {};
      const context = vm.createContext({
        self: mockSelf,
        caches: mockCaches,
        fetch: mockFetch,
        Promise,
        console
      });
      vm.runInContext(swCode, context);

      let respondedWith;
      const event = {
        request: { url: 'https://cdn.example.com/lib.js' },
        respondWith: jest.fn((p) => { respondedWith = p; })
      };

      listeners.fetch(event);
      await respondedWith;

      expect(mockCache.put).not.toHaveBeenCalled();
    });
  });
});
