/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('Storage', () => {
  let app, storageMock;

  beforeEach(() => {
    setupDOM();
    storageMock = setupLocalStorageMock();
    app = loadApp();
  });

  describe('get', () => {
    it('returns empty array when key does not exist', () => {
      expect(app.Storage.get('nonexistent')).toEqual([]);
    });

    it('returns parsed JSON when key exists', () => {
      const data = [{ id: '1', name: 'test' }];
      storageMock.setItem('myKey', JSON.stringify(data));
      expect(app.Storage.get('myKey')).toEqual(data);
    });

    it('returns empty array for null localStorage value', () => {
      storageMock.getItem.mockReturnValueOnce(null);
      expect(app.Storage.get('anything')).toEqual([]);
    });
  });

  describe('set', () => {
    it('stores JSON stringified value', () => {
      const data = [{ id: '1' }];
      app.Storage.set('key1', data);
      expect(storageMock.setItem).toHaveBeenCalledWith('key1', JSON.stringify(data));
    });

    it('stores empty array', () => {
      app.Storage.set('empty', []);
      expect(storageMock.setItem).toHaveBeenCalledWith('empty', '[]');
    });

    it('stores nested objects', () => {
      const nested = [{ a: { b: [1, 2, 3] } }];
      app.Storage.set('nested', nested);
      expect(storageMock.setItem).toHaveBeenCalledWith('nested', JSON.stringify(nested));
    });
  });
});
