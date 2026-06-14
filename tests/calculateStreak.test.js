/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('calculateStreak', () => {
  let app;

  beforeEach(() => {
    setupDOM();
    setupLocalStorageMock();
    app = loadApp();
  });

  it('returns 0 when completedDates is undefined', () => {
    expect(app.calculateStreak({})).toBe(0);
  });

  it('returns 0 when completedDates is empty', () => {
    expect(app.calculateStreak({ completedDates: [] })).toBe(0);
  });

  it('returns 1 when only today is completed', () => {
    const today = new Date().toDateString();
    expect(app.calculateStreak({ completedDates: [today] })).toBe(1);
  });

  it('returns 1 when only yesterday is completed', () => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    expect(app.calculateStreak({ completedDates: [yesterday] })).toBe(1);
  });

  it('returns 2 for today and yesterday', () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    expect(app.calculateStreak({ completedDates: [today, yesterday] })).toBe(2);
  });

  it('returns correct streak for consecutive days ending today', () => {
    const dates = [];
    for (let i = 0; i < 5; i++) {
      dates.push(new Date(Date.now() - i * 86400000).toDateString());
    }
    expect(app.calculateStreak({ completedDates: dates })).toBe(5);
  });

  it('returns correct streak for consecutive days ending yesterday', () => {
    const dates = [];
    for (let i = 1; i <= 3; i++) {
      dates.push(new Date(Date.now() - i * 86400000).toDateString());
    }
    expect(app.calculateStreak({ completedDates: dates })).toBe(3);
  });

  it('breaks streak on gaps', () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    // Skip 2 days ago, include 3 days ago
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toDateString();
    expect(app.calculateStreak({ completedDates: [today, yesterday, threeDaysAgo] })).toBe(2);
  });

  it('returns 0 when most recent date is 2+ days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    expect(app.calculateStreak({ completedDates: [twoDaysAgo] })).toBe(0);
  });

  it('handles unordered dates correctly', () => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    // Dates out of order
    expect(app.calculateStreak({ completedDates: [twoDaysAgo, today, yesterday] })).toBe(3);
  });
});
