// ========== Shared Utilities ==========

const Utils = {
    /**
     * Generate a unique ID based on current timestamp.
     */
    generateId() {
        return Date.now().toString();
    },

    /**
     * Render an empty state placeholder inside a container.
     */
    renderEmptyState(container, emoji, title, subtitle) {
        container.innerHTML = `
            <div class="empty-state">
                <div style="font-size: 64px; margin-bottom: 16px;">${emoji}</div>
                <div>${title}</div>
                <div style="font-size: 14px; margin-top: 8px;">${subtitle}</div>
            </div>
        `;
    },

    /**
     * Generic "add item" CRUD helper.
     * Builds an item with auto-generated id/createdAt, appends to storage, then re-renders.
     */
    addItem(storageKey, itemData, renderFn) {
        const items = Storage.get(storageKey);
        items.push({
            id: Utils.generateId(),
            createdAt: new Date().toISOString(),
            ...itemData
        });
        Storage.set(storageKey, items);
        renderFn();
    },

    /**
     * Generic "delete item" CRUD helper.
     * Removes item by ID from storage, then re-renders.
     */
    deleteItem(storageKey, id, renderFn) {
        const items = Storage.get(storageKey).filter(item => item.id !== id);
        Storage.set(storageKey, items);
        renderFn();
    },

    /**
     * Generic "toggle boolean property" helper.
     * Finds item by ID, flips a boolean field, saves, then re-renders.
     */
    toggleItemProp(storageKey, id, prop, renderFn) {
        const items = Storage.get(storageKey);
        const item = items.find(i => i.id === id);
        if (item) {
            item[prop] = !item[prop];
            Storage.set(storageKey, items);
            renderFn();
        }
    },

    /**
     * Show a modal by ID.
     */
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    },

    /**
     * Hide a modal by ID.
     */
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    },

    /**
     * Batch-update multiple DOM elements' textContent.
     * Accepts an object mapping element IDs to values.
     */
    updateTextContent(updates) {
        for (const [id, value] of Object.entries(updates)) {
            document.getElementById(id).textContent = value;
        }
    }
};
