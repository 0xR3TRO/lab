/**
 * AccessPoint - Mock User Database (localStorage)
 * Provides CRUD operations for user data persisted in localStorage.
 */

const Storage = (() => {
    const USERS_KEY = "ap_users";
    const TOKENS_KEY = "ap_reset_tokens";

    function _getCollection(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch {
            return [];
        }
    }

    function _saveCollection(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // ── Users ────────────────────────────────────────────

    function getUsers() {
        return _getCollection(USERS_KEY);
    }

    function findUserByEmail(email) {
        return (
            getUsers().find(
                (u) => u.email.toLowerCase() === email.toLowerCase(),
            ) || null
        );
    }

    function findUserById(id) {
        return getUsers().find((u) => u.id === id) || null;
    }

    function createUser(user) {
        const users = getUsers();
        users.push(user);
        _saveCollection(USERS_KEY, users);
        return user;
    }

    function updateUser(id, updates) {
        const users = getUsers();
        const index = users.findIndex((u) => u.id === id);
        if (index === -1) return null;
        users[index] = { ...users[index], ...updates };
        _saveCollection(USERS_KEY, users);
        return users[index];
    }

    // ── Reset Tokens ─────────────────────────────────────

    function getResetTokens() {
        return _getCollection(TOKENS_KEY);
    }

    function saveResetToken(tokenData) {
        const tokens = getResetTokens().filter(
            (t) => t.email !== tokenData.email,
        );
        tokens.push(tokenData);
        _saveCollection(TOKENS_KEY, tokens);
    }

    function findResetToken(token) {
        return getResetTokens().find((t) => t.token === token) || null;
    }

    function removeResetToken(token) {
        const filtered = getResetTokens().filter((t) => t.token !== token);
        _saveCollection(TOKENS_KEY, filtered);
    }

    return {
        getUsers,
        findUserByEmail,
        findUserById,
        createUser,
        updateUser,
        getResetTokens,
        saveResetToken,
        findResetToken,
        removeResetToken,
    };
})();
