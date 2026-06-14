/**
 * Shared test setup: creates the minimal DOM structure that app.js
 * queries on load, and provides a localStorage mock.
 */

function setupDOM() {
  document.body.innerHTML = `
    <div id="currentDate"></div>
    <div id="habitsList"></div>
    <div id="workoutsList"></div>
    <div id="ideasList"></div>
    <div id="videosList"></div>
    <div id="habitCompleted"></div>
    <div id="habitTotal"></div>
    <div id="habitStreak"></div>
    <div id="workoutCount"></div>
    <div id="totalVolume"></div>
    <div id="totalSets"></div>
    <div id="encouragementModal">
      <div id="encouragementEmoji"></div>
      <div id="encouragementText"></div>
      <div id="encouragementSubtext"></div>
    </div>
    <div id="addHabitModal"></div>
    <input id="habitNameInput" />
    <div id="addWorkoutModal"></div>
    <div id="workoutExercises"></div>
    <div id="restTimerBanner">
      <span id="restTimerDisplay"></span>
    </div>
    <input id="ideaInput" />
    <input id="videoUrlInput" />
    <button id="fabBtn"></button>
    <div class="page active" id="page-habits"></div>
    <div class="page" id="page-workout"></div>
    <div class="page" id="page-ideas"></div>
    <div class="page" id="page-videos"></div>
    <div class="nav-item active"></div>
    <div class="modal-overlay"></div>
  `;
}

function setupLocalStorageMock() {
  const store = {};
  const mock = {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => { store[key] = String(value); }),
    removeItem: jest.fn((key) => { delete store[key]; }),
    clear: jest.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    _store: store
  };
  Object.defineProperty(window, 'localStorage', { value: mock, writable: true });
  return mock;
}

function loadApp() {
  // Clear module cache to get a fresh app instance
  const appPath = require.resolve('../app');
  delete require.cache[appPath];
  return require('../app');
}

module.exports = { setupDOM, setupLocalStorageMock, loadApp };
