// Session Utility: Provides reusable helper functions for managing
// authenticated user session data in browser storage.

// Storage key used throughout the application
const SESSION_KEY = "userSession";

export const saveSession = (sessionData) => {
    localStorage.setItem(
        SESSION_KEY,
        JSON.stringify(sessionData)
    );
};

export const getSession = () => {
    const session = localStorage.getItem(SESSION_KEY);

    return session ? JSON.parse(session): null;
};

export const clearSession = () => {
    localStorage.removeItem(SESSION_KEY);
};