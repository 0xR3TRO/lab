/**
 * AccessPoint - Mock Session Handler
 * Manages user sessions using sessionStorage.
 */

const Session = (() => {
    const SESSION_KEY = "ap_session";

    /**
     * Create a new session for the given user.
     * @param {{ id: string, email: string, name: string }} user
     */
    function create(user) {
        const session = {
            userId: user.id,
            email: user.email,
            name: user.name,
            createdAt: Date.now(),
            expiresAt: Date.now() + 30 * 60 * 1000, // 30 minutes
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    }

    /**
     * Get the current session if it exists and has not expired.
     * @returns {object|null}
     */
    function get() {
        try {
            const raw = sessionStorage.getItem(SESSION_KEY);
            if (!raw) return null;
            const session = JSON.parse(raw);
            if (Date.now() > session.expiresAt) {
                destroy();
                return null;
            }
            return session;
        } catch {
            return null;
        }
    }

    /**
     * Check whether the user is currently authenticated.
     * @returns {boolean}
     */
    function isAuthenticated() {
        return get() !== null;
    }

    /**
     * Destroy the current session (logout).
     */
    function destroy() {
        sessionStorage.removeItem(SESSION_KEY);
    }

    /**
     * Refresh the session expiry time.
     */
    function refresh() {
        const session = get();
        if (session) {
            session.expiresAt = Date.now() + 30 * 60 * 1000;
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }
    }

    return { create, get, isAuthenticated, destroy, refresh };
})();
