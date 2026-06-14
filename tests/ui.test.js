/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('UI & General Functions', () => {
  let app;

  beforeEach(() => {
    setupDOM();
    setupLocalStorageMock();
    app = loadApp();
  });

  describe('updateDate', () => {
    it('sets currentDate element text', () => {
      app.updateDate();
      const dateEl = document.getElementById('currentDate');
      expect(dateEl.textContent).not.toBe('');
      // Should contain year
      expect(dateEl.textContent).toMatch(/\d{4}/);
    });
  });

  describe('hideModal', () => {
    it('removes show class from modal', () => {
      const modal = document.getElementById('addHabitModal');
      modal.classList.add('show');
      app.hideModal('addHabitModal');
      expect(modal.classList.contains('show')).toBe(false);
    });
  });

  describe('showEncouragement', () => {
    it('adds show class to encouragement modal', () => {
      app.showEncouragement();
      const modal = document.getElementById('encouragementModal');
      expect(modal.classList.contains('show')).toBe(true);
    });

    it('sets emoji, text, and subtext', () => {
      app.showEncouragement();
      expect(document.getElementById('encouragementEmoji').textContent).not.toBe('');
      expect(document.getElementById('encouragementText').textContent).not.toBe('');
      expect(document.getElementById('encouragementSubtext').textContent).not.toBe('');
    });
  });

  describe('hideEncouragementModal', () => {
    it('removes show class', () => {
      const modal = document.getElementById('encouragementModal');
      modal.classList.add('show');
      app.hideEncouragementModal();
      expect(modal.classList.contains('show')).toBe(false);
    });
  });

  describe('showAddHabitModal', () => {
    it('shows modal and resets input', () => {
      document.getElementById('habitNameInput').value = 'old value';
      app.showAddHabitModal();
      expect(document.getElementById('addHabitModal').classList.contains('show')).toBe(true);
      expect(document.getElementById('habitNameInput').value).toBe('');
      expect(app.selectedIcon).toBe('⭐');
    });
  });

  describe('encouragements data', () => {
    it('contains at least 1 encouragement', () => {
      expect(app.encouragements.length).toBeGreaterThan(0);
    });

    it('each encouragement has emoji, text, and subtext', () => {
      app.encouragements.forEach(e => {
        expect(e.emoji).toBeDefined();
        expect(e.text).toBeDefined();
        expect(e.subtext).toBeDefined();
      });
    });
  });

  describe('exerciseDetails data', () => {
    it('contains entries for common exercises', () => {
      expect(app.exerciseDetails['深蹲']).toBeDefined();
      expect(app.exerciseDetails['卧推']).toBeDefined();
      expect(app.exerciseDetails['硬拉']).toBeDefined();
    });
  });

  describe('updateStats', () => {
    it('calls updateHabitStats and updateWorkoutStats without error', () => {
      expect(() => app.updateStats()).not.toThrow();
    });
  });
});
