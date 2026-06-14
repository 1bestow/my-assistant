/**
 * @jest-environment jsdom
 */
const { setupDOM, setupLocalStorageMock, loadApp } = require('./setup');

describe('Ideas', () => {
  let app, storageMock;

  beforeEach(() => {
    setupDOM();
    storageMock = setupLocalStorageMock();
    app = loadApp();
  });

  describe('addIdea', () => {
    it('does nothing when input is empty', () => {
      document.getElementById('ideaInput').value = '';
      app.addIdea();
      const ideaCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'ideas');
      expect(ideaCalls).toHaveLength(0);
    });

    it('does nothing when input is only whitespace', () => {
      document.getElementById('ideaInput').value = '   ';
      app.addIdea();
      const ideaCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'ideas');
      expect(ideaCalls).toHaveLength(0);
    });

    it('adds idea with correct structure', () => {
      document.getElementById('ideaInput').value = 'Build a robot';
      app.addIdea();

      const ideaCalls = storageMock.setItem.mock.calls.filter(c => c[0] === 'ideas');
      expect(ideaCalls.length).toBeGreaterThan(0);

      const saved = JSON.parse(ideaCalls[ideaCalls.length - 1][1]);
      const added = saved[saved.length - 1];
      expect(added.content).toBe('Build a robot');
      expect(added.completed).toBe(false);
      expect(added.id).toBeDefined();
      expect(added.createdAt).toBeDefined();
    });

    it('clears input after adding', () => {
      document.getElementById('ideaInput').value = 'Hello';
      app.addIdea();
      expect(document.getElementById('ideaInput').value).toBe('');
    });
  });

  describe('toggleIdeaComplete', () => {
    it('toggles completed to true', () => {
      const ideas = [{ id: '1', content: 'test', completed: false, createdAt: new Date().toISOString() }];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.toggleIdeaComplete('1');

      const saved = JSON.parse(storageMock._store.ideas);
      expect(saved[0].completed).toBe(true);
    });

    it('toggles completed back to false', () => {
      const ideas = [{ id: '1', content: 'test', completed: true, createdAt: new Date().toISOString() }];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.toggleIdeaComplete('1');

      const saved = JSON.parse(storageMock._store.ideas);
      expect(saved[0].completed).toBe(false);
    });

    it('does nothing for non-existent id', () => {
      const ideas = [{ id: '1', content: 'test', completed: false, createdAt: new Date().toISOString() }];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.toggleIdeaComplete('999');

      const saved = JSON.parse(storageMock._store.ideas);
      expect(saved[0].completed).toBe(false);
    });
  });

  describe('deleteIdea', () => {
    it('removes idea by id', () => {
      const ideas = [
        { id: '1', content: 'first', completed: false },
        { id: '2', content: 'second', completed: false }
      ];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.deleteIdea('1');

      const saved = JSON.parse(storageMock._store.ideas);
      expect(saved).toHaveLength(1);
      expect(saved[0].id).toBe('2');
    });

    it('handles deleting non-existent id gracefully', () => {
      const ideas = [{ id: '1', content: 'test', completed: false }];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.deleteIdea('999');

      const saved = JSON.parse(storageMock._store.ideas);
      expect(saved).toHaveLength(1);
    });
  });

  describe('renderIdeas', () => {
    it('shows empty state when no ideas', () => {
      app.renderIdeas();
      const container = document.getElementById('ideasList');
      expect(container.innerHTML).toContain('还没有记录灵感');
    });

    it('renders ideas with content', () => {
      const ideas = [
        { id: '1', content: 'My great idea', completed: false, createdAt: new Date().toISOString() }
      ];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.renderIdeas();
      const container = document.getElementById('ideasList');
      expect(container.innerHTML).toContain('My great idea');
    });

    it('shows line-through for completed ideas', () => {
      const ideas = [
        { id: '1', content: 'Done idea', completed: true, createdAt: new Date().toISOString() }
      ];
      storageMock._store.ideas = JSON.stringify(ideas);

      app.renderIdeas();
      const container = document.getElementById('ideasList');
      expect(container.innerHTML).toContain('line-through');
    });
  });
});
