/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('parseVideoUrl', () => {
  let app;

  beforeEach(() => {
    setupDOM();
    setupLocalStorageMock();
    app = loadApp();
  });

  it('identifies Douyin URLs', () => {
    const result = app.parseVideoUrl('https://www.douyin.com/video/123');
    expect(result.platform).toBe('抖音');
    expect(result.title).toBe('抖音视频');
    expect(result.tags).toEqual(['短视频']);
  });

  it('identifies iesdouyin.com URLs', () => {
    const result = app.parseVideoUrl('https://v.iesdouyin.com/abc');
    expect(result.platform).toBe('抖音');
  });

  it('identifies Bilibili URLs', () => {
    const result = app.parseVideoUrl('https://www.bilibili.com/video/BV1xx');
    expect(result.platform).toBe('B站');
    expect(result.title).toBe('B站视频');
    expect(result.tags).toEqual(['长视频']);
  });

  it('identifies b23.tv short URLs', () => {
    const result = app.parseVideoUrl('https://b23.tv/abc123');
    expect(result.platform).toBe('B站');
  });

  it('identifies YouTube URLs', () => {
    const result = app.parseVideoUrl('https://www.youtube.com/watch?v=abc');
    expect(result.platform).toBe('YouTube');
    expect(result.title).toBe('YouTube视频');
    expect(result.tags).toEqual(['海外']);
  });

  it('identifies youtu.be short URLs', () => {
    const result = app.parseVideoUrl('https://youtu.be/abc123');
    expect(result.platform).toBe('YouTube');
  });

  it('identifies Xiaohongshu URLs', () => {
    const result = app.parseVideoUrl('https://www.xiaohongshu.com/explore/abc');
    expect(result.platform).toBe('小红书');
    expect(result.title).toBe('小红书视频');
    expect(result.tags).toEqual(['生活']);
  });

  it('identifies Kuaishou URLs', () => {
    const result = app.parseVideoUrl('https://www.kuaishou.com/short-video/abc');
    expect(result.platform).toBe('快手');
    expect(result.title).toBe('快手视频');
    expect(result.tags).toEqual(['短视频']);
  });

  it('returns unknown platform for unrecognized URLs', () => {
    const result = app.parseVideoUrl('https://www.example.com/video');
    expect(result.platform).toBe('未知平台');
    expect(result.title).toBe('视频链接');
    expect(result.tags).toEqual([]);
  });

  it('returns unknown platform for empty string', () => {
    const result = app.parseVideoUrl('');
    expect(result.platform).toBe('未知平台');
  });
});
