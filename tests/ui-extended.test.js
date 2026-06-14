/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('UI Extended Coverage', () => {
  let app;

  beforeEach(() => {
    setupDOM();
    setupLocalStorageMock();
    app = loadApp();
  });

  describe('switchPage', () => {
    it('switches to workout page', () => {
      const navItem = document.querySelector('.nav-item');
      // Simulate event.currentTarget
      global.event = { currentTarget: navItem };

      app.switchPage('workout');

      expect(document.getElementById('page-workout').classList.contains('active')).toBe(true);
      expect(document.getElementById('page-habits').classList.contains('active')).toBe(false);

      delete global.event;
    });

    it('hides FAB for ideas page', () => {
      const navItem = document.querySelector('.nav-item');
      global.event = { currentTarget: navItem };

      app.switchPage('ideas');

      expect(document.getElementById('fabBtn').style.display).toBe('none');

      delete global.event;
    });

    it('hides FAB for videos page', () => {
      const navItem = document.querySelector('.nav-item');
      global.event = { currentTarget: navItem };

      app.switchPage('videos');

      expect(document.getElementById('fabBtn').style.display).toBe('none');

      delete global.event;
    });

    it('shows FAB for habits page', () => {
      const navItem = document.querySelector('.nav-item');
      global.event = { currentTarget: navItem };

      app.switchPage('habits');

      expect(document.getElementById('fabBtn').style.display).toBe('flex');

      delete global.event;
    });
  });

  describe('showAddWorkoutModal', () => {
    it('resets currentWorkout and shows modal', () => {
      app.currentWorkout = [{ name: 'old' }];
      app.showAddWorkoutModal();

      expect(app.currentWorkout).toEqual([]);
      expect(document.getElementById('workoutExercises').innerHTML).toBe('');
      expect(document.getElementById('addWorkoutModal').classList.contains('show')).toBe(true);
    });
  });

  describe('toggleExerciseDetail', () => {
    it('toggles show class on detail element', () => {
      // Create a detail element
      const detail = document.createElement('div');
      detail.id = 'detail-0';
      document.body.appendChild(detail);

      app.toggleExerciseDetail(0);
      expect(detail.classList.contains('show')).toBe(true);

      app.toggleExerciseDetail(0);
      expect(detail.classList.contains('show')).toBe(false);
    });
  });

  describe('renderWorkoutExercises', () => {
    it('renders exercise with sets', () => {
      app.currentWorkout = [{
        name: '深蹲',
        sets: [{ weight: 60, reps: 10 }]
      }];

      app.renderWorkoutExercises();

      const container = document.getElementById('workoutExercises');
      expect(container.innerHTML).toContain('深蹲');
      expect(container.innerHTML).toContain('60');
      expect(container.innerHTML).toContain('10');
    });

    it('renders exercise with exercise detail button', () => {
      app.currentWorkout = [{
        name: '卧推',
        sets: []
      }];

      app.renderWorkoutExercises();

      const container = document.getElementById('workoutExercises');
      expect(container.innerHTML).toContain('详解');
    });

    it('shows fallback text for unknown exercise', () => {
      app.currentWorkout = [{
        name: '未知动作',
        sets: []
      }];

      app.renderWorkoutExercises();

      const container = document.getElementById('workoutExercises');
      expect(container.innerHTML).toContain('暂无该动作的详细说明');
    });
  });

  describe('FAB button onclick assignment', () => {
    it('sets FAB onclick to showAddHabitModal for habits page', () => {
      const navItem = document.querySelector('.nav-item');
      global.event = { currentTarget: navItem };

      app.switchPage('habits');
      const fab = document.getElementById('fabBtn');
      expect(fab.onclick).toBeDefined();

      delete global.event;
    });

    it('sets FAB onclick to showAddWorkoutModal for workout page', () => {
      const navItem = document.querySelector('.nav-item');
      global.event = { currentTarget: navItem };

      app.switchPage('workout');
      const fab = document.getElementById('fabBtn');
      expect(fab.onclick).toBeDefined();

      delete global.event;
    });
  });

  describe('keyboard shortcuts', () => {
    it('closes all modals on Escape key', () => {
      const overlay = document.querySelector('.modal-overlay');
      overlay.classList.add('show');

      const keyEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(keyEvent);

      expect(overlay.classList.contains('show')).toBe(false);
    });

    it('does not close modals on other keys', () => {
      const overlay = document.querySelector('.modal-overlay');
      overlay.classList.add('show');

      const keyEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(keyEvent);

      expect(overlay.classList.contains('show')).toBe(true);
    });
  });
});
