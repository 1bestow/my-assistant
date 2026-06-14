/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('Workouts', () => {
  let app, storageMock;

  beforeEach(() => {
    setupDOM();
    storageMock = setupLocalStorageMock();
    jest.useFakeTimers();
    app = loadApp();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('addExercise', () => {
    it('adds exercise to currentWorkout', () => {
      app.currentWorkout = [];
      app.addExercise('深蹲');
      expect(app.currentWorkout).toHaveLength(1);
      expect(app.currentWorkout[0].name).toBe('深蹲');
      expect(app.currentWorkout[0].sets).toEqual([]);
    });

    it('accumulates exercises', () => {
      app.currentWorkout = [];
      app.addExercise('深蹲');
      app.addExercise('卧推');
      expect(app.currentWorkout).toHaveLength(2);
    });
  });

  describe('addSet', () => {
    it('adds empty set to the specified exercise', () => {
      app.currentWorkout = [{ name: '深蹲', sets: [], lastSetTime: null }];
      app.addSet(0);
      expect(app.currentWorkout[0].sets).toHaveLength(1);
      expect(app.currentWorkout[0].sets[0]).toEqual({ weight: '', reps: '' });
    });
  });

  describe('updateSet', () => {
    it('updates weight of a set', () => {
      app.currentWorkout = [{ name: '深蹲', sets: [{ weight: '', reps: '' }] }];
      app.updateSet(0, 0, 'weight', '60');
      expect(app.currentWorkout[0].sets[0].weight).toBe(60);
    });

    it('updates reps of a set', () => {
      app.currentWorkout = [{ name: '深蹲', sets: [{ weight: 60, reps: '' }] }];
      app.updateSet(0, 0, 'reps', '12');
      expect(app.currentWorkout[0].sets[0].reps).toBe(12);
    });

    it('defaults to 0 for invalid values', () => {
      app.currentWorkout = [{ name: '深蹲', sets: [{ weight: '', reps: '' }] }];
      app.updateSet(0, 0, 'weight', 'abc');
      expect(app.currentWorkout[0].sets[0].weight).toBe(0);
    });
  });

  describe('removeSet', () => {
    it('removes a set from the specified exercise', () => {
      app.currentWorkout = [{
        name: '深蹲',
        sets: [{ weight: 60, reps: 10 }, { weight: 80, reps: 8 }]
      }];
      app.removeSet(0, 0);
      expect(app.currentWorkout[0].sets).toHaveLength(1);
      expect(app.currentWorkout[0].sets[0].weight).toBe(80);
    });
  });

  describe('saveWorkout', () => {
    it('does not save when currentWorkout is empty', () => {
      app.currentWorkout = [];
      const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
      app.saveWorkout();
      alertMock.mockRestore();

      const workoutCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'workouts');
      expect(workoutCalls).toHaveLength(0);
    });

    it('saves workout with exercises', () => {
      app.currentWorkout = [{
        name: '深蹲',
        sets: [{ weight: 60, reps: 10 }]
      }];
      app.saveWorkout();

      const workoutCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'workouts');
      expect(workoutCalls.length).toBeGreaterThan(0);

      const lastCall = workoutCalls[workoutCalls.length - 1];
      const saved = JSON.parse(lastCall[1]);
      expect(saved[saved.length - 1].exercises[0].name).toBe('深蹲');
    });
  });

  describe('deleteWorkout', () => {
    it('removes workout by id', () => {
      const workouts = [
        { id: '1', date: new Date().toISOString(), exercises: [] },
        { id: '2', date: new Date().toISOString(), exercises: [] }
      ];
      storageMock._store.workouts = JSON.stringify(workouts);

      const mockEvent = { stopPropagation: jest.fn() };
      app.deleteWorkout('1', mockEvent);

      expect(mockEvent.stopPropagation).toHaveBeenCalled();
      const saved = JSON.parse(storageMock._store.workouts);
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('2');
    });
  });

  describe('renderWorkouts', () => {
    it('shows empty state when no workouts', () => {
      app.renderWorkouts();
      const container = document.getElementById('workoutsList');
      expect(container.innerHTML).toContain('还没有训练记录');
    });

    it('renders workout entries', () => {
      const workouts = [{
        id: '1',
        date: new Date().toISOString(),
        exercises: [{
          name: '深蹲',
          sets: [{ weight: 60, reps: 10 }]
        }]
      }];
      storageMock._store.workouts = JSON.stringify(workouts);

      app.renderWorkouts();
      const container = document.getElementById('workoutsList');
      expect(container.innerHTML).toContain('1个动作');
    });
  });

  describe('updateWorkoutStats', () => {
    it('calculates correct totals', () => {
      const workouts = [{
        id: '1',
        date: new Date().toISOString(),
        exercises: [{
          name: '深蹲',
          sets: [
            { weight: 60, reps: 10 },
            { weight: 80, reps: 8 }
          ]
        }]
      }];
      storageMock._store.workouts = JSON.stringify(workouts);

      app.updateWorkoutStats();

      const totalVolume = 60 * 10 + 80 * 8; // 1240
      expect(document.getElementById('totalVolume').textContent).toBe(totalVolume.toFixed(0));
      expect(document.getElementById('totalSets').textContent).toBe('2');
    });
  });

  describe('startRestTimer / stopRestTimer', () => {
    it('starts a timer that increments', () => {
      app.startRestTimer();
      expect(app.restTimerInterval).not.toBeNull();

      jest.advanceTimersByTime(3000);
      expect(document.getElementById('restTimerDisplay').textContent).toBe('00:03');

      app.stopRestTimer();
      expect(app.restTimerInterval).toBeNull();
    });

    it('formats minutes and seconds correctly', () => {
      app.startRestTimer();
      jest.advanceTimersByTime(65000); // 1 min 5 sec
      expect(document.getElementById('restTimerDisplay').textContent).toBe('01:05');
      app.stopRestTimer();
    });

    it('clears previous timer when starting a new one', () => {
      app.startRestTimer();
      const firstInterval = app.restTimerInterval;
      app.startRestTimer();
      expect(app.restTimerInterval).not.toBe(firstInterval);
      app.stopRestTimer();
    });
  });
});
