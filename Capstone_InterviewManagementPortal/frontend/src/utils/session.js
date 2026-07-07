/**
 * Session Utility: Provides reusable helper functions for managing
 * authenticated user session data in browser storage.
 * Components should never access localStorage directly.
 */

// Storage key used throughout the application.
const SESSION_KEY = "userSession";

/**
 * Saves authenticated user data.
 * @param {Object} sessionData
 */
export const saveSession = (sessionData) => {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(sessionData)
    );
};

/**
 * Retrieves the current authenticated session.
 * @returns {Object|null}
 */
export const getSession = () => {
    const session = localStorage.getItem(SESSION_KEY);

    return session ? JSON.parse(session): null;
};

/** Removes the current authenticated session.*/
export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};