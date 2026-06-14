/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('Videos', () => {
  let app, storageMock;

  beforeEach(() => {
    setupDOM();
    storageMock = setupLocalStorageMock();
    app = loadApp();
  });

  describe('addVideo', () => {
    it('does nothing when URL is empty', () => {
      document.getElementById('videoUrlInput').value = '';
      app.addVideo();
      const videoCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'videos');
      expect(videoCalls).toHaveLength(0);
    });

    it('adds video with parsed platform info', () => {
      document.getElementById('videoUrlInput').value = 'https://www.bilibili.com/video/BV1xx';
      app.addVideo();

      const videoCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'videos');
      expect(videoCalls.length).toBeGreaterThan(0);

      const saved = JSON.parse(videoCalls[videoCalls.length - 1][1]);
      const added = saved[saved.length - 1];
      expect(added.platform).toBe('B站');
      expect(added.title).toBe('B站视频');
      expect(added.url).toBe('https://www.bilibili.com/video/BV1xx');
      expect(added.tags).toEqual(['长视频']);
    });

    it('clears input after adding', () => {
      document.getElementById('videoUrlInput').value = 'https://www.youtube.com/watch?v=abc';
      app.addVideo();
      expect(document.getElementById('videoUrlInput').value).toBe('');
    });

    it('stores unknown platform for unrecognized URL', () => {
      document.getElementById('videoUrlInput').value = 'https://example.com/video';
      app.addVideo();

      const videoCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'videos');
      const saved = JSON.parse(videoCalls[videoCalls.length - 1][1]);
      expect(saved[saved.length - 1].platform).toBe('未知平台');
    });
  });

  describe('renderVideos', () => {
    it('shows empty state when no videos', () => {
      app.renderVideos();
      const container = document.getElementById('videosList');
      expect(container.innerHTML).toContain('还没有保存视频');
    });

    it('renders video cards', () => {
      const videos = [{
        id: '1',
        url: 'https://www.bilibili.com/video/BV1xx',
        title: 'B站视频',
        platform: 'B站',
        tags: ['长视频'],
        createdAt: new Date().toISOString()
      }];
      storageMock._store.videos = JSON.stringify(videos);

      app.renderVideos();
      const container = document.getElementById('videosList');
      expect(container.innerHTML).toContain('B站视频');
      expect(container.innerHTML).toContain('B站');
    });

    it('shows 未命名视频 when title is empty', () => {
      const videos = [{
        id: '1',
        url: 'https://example.com',
        title: '',
        platform: '未知平台',
        tags: [],
        createdAt: new Date().toISOString()
      }];
      storageMock._store.videos = JSON.stringify(videos);

      app.renderVideos();
      const container = document.getElementById('videosList');
      expect(container.innerHTML).toContain('未命名视频');
    });
  });

  describe('openVideo', () => {
    it('opens URL in new tab', () => {
      const openSpy = jest.spyOn(window, 'open').mockImplementation(() => {});
      app.openVideo('https://www.youtube.com/watch?v=abc');
      expect(openSpy).toHaveBeenCalledWith('https://www.youtube.com/watch?v=abc', '_blank');
      openSpy.mockRestore();
    });
  });
});
