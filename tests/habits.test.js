/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('Habits', () => {
  let app, storageMock;

  beforeEach(() => {
    setupDOM();
    storageMock = setupLocalStorageMock();
    app = loadApp();
  });

  describe('addHabit', () => {
    it('does nothing when name is empty', () => {
      document.getElementById('habitNameInput').value = '';
      app.addHabit();
      // Storage.set should only have been called during initial render, not for adding
      const habitsCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'habits');
      expect(habitsCalls).toHaveLength(0);
    });

    it('does nothing when name is whitespace', () => {
      document.getElementById('habitNameInput').value = '   ';
      app.addHabit();
      const habitsCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'habits');
      expect(habitsCalls).toHaveLength(0);
    });

    it('adds a habit with correct structure', () => {
      document.getElementById('habitNameInput').value = 'Read books';
      app.selectedIcon = '📚';
      app.addHabit();

      const habitsCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'habits');
      expect(habitsCalls.length).toBeGreaterThan(0);

      const lastCall = habitsCalls[habitsCalls.length - 1];
      const savedHabits = JSON.parse(lastCall[1]);
      const added = savedHabits[savedHabits.length - 1];

      expect(added.name).toBe('Read books');
      expect(added.icon).toBe('📚');
      expect(added.completedDates).toEqual([]);
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
    });
  });

  describe('toggleHabit', () => {
    it('adds today to completedDates when not completed', () => {
      const today = new Date().toDateString();
      const habits = [{ id: '1', name: 'Test', icon: '⭐', completedDates: [] }];
      storageMock._store.habits = JSON.stringify(habits);

      app.toggleHabit('1');

      const saved = JSON.parse(storageMock._store.habits);
      expect(saved[0].completedDates).toContain(today);
    });

    it('removes today from completedDates when already completed', () => {
      const today = new Date().toDateString();
      const habits = [{ id: '1', name: 'Test', icon: '⭐', completedDates: [today] }];
      storageMock._store.habits = JSON.stringify(habits);

      app.toggleHabit('1');

      const saved = JSON.parse(storageMock._store.habits);
      expect(saved[0].completedDates).not.toContain(today);
    });

    it('initializes completedDates if undefined', () => {
      const habits = [{ id: '1', name: 'Test', icon: '⭐' }];
      storageMock._store.habits = JSON.stringify(habits);

      app.toggleHabit('1');

      const saved = JSON.parse(storageMock._store.habits);
      expect(Array.isArray(saved[0].completedDates)).toBe(true);
    });
  });

  describe('renderHabits', () => {
    it('shows empty state when no habits', () => {
      app.renderHabits();
      const container = document.getElementById('habitsList');
      expect(container.innerHTML).toContain('还没有习惯');
    });

    it('renders habit items when habits exist', () => {
      const today = new Date().toDateString();
      const habits = [
        { id: '1', name: 'Exercise', icon: '🏃', completedDates: [today] },
        { id: '2', name: 'Read', icon: '📖', completedDates: [] }
      ];
      storageMock._store.habits = JSON.stringify(habits);

      app.renderHabits();
      const container = document.getElementById('habitsList');
      expect(container.innerHTML).toContain('Exercise');
      expect(container.innerHTML).toContain('Read');
    });
  });

  describe('updateHabitStats', () => {
    it('displays correct stats', () => {
      const today = new Date().toDateString();
      const habits = [
        { id: '1', name: 'A', icon: '⭐', completedDates: [today] },
        { id: '2', name: 'B', icon: '⭐', completedDates: [] }
      ];
      storageMock._store.habits = JSON.stringify(habits);

      app.updateHabitStats();

      expect(document.getElementById('habitCompleted').textContent).toBe('1');
      expect(document.getElementById('habitTotal').textContent).toBe('2');
    });
  });

  describe('selectIcon', () => {
    it('updates selectedIcon', () => {
      app.selectIcon('🎯');
      expect(app.selectedIcon).toBe('🎯');
    });
  });
});
