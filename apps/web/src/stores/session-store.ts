// Session Store - Manages unique session IDs and session-scoped data

import { generateId } from '@/lib/utils';

const SESSION_ID_KEY = 'zynex-session-id';
const SESSION_KEYS_TO_CLEAR = ['zynex-cart', 'zynex-wishlist'];

interface SessionManager {
  getSessionId: () => string;
  isNewSession: () => boolean;
  clearSessionData: () => void;
  initializeSession: () => string;
}

function createSessionManager(): SessionManager {
  let sessionId: string | null = null;
  let isNew = false;

  return {
    /**
     * Get the current session ID, creating one if it doesn't exist
     */
    getSessionId: () => {
      if (sessionId) return sessionId;

      if (typeof window !== 'undefined') {
        // Check sessionStorage for existing session ID
        const stored = sessionStorage.getItem(SESSION_ID_KEY);
        if (stored) {
          sessionId = stored;
        } else {
          // Generate new session ID
          sessionId = `session_${generateId()}_${Date.now()}`;
          sessionStorage.setItem(SESSION_ID_KEY, sessionId);
          isNew = true;
        }
      } else {
        sessionId = `server_session_${generateId()}`;
      }

      return sessionId;
    },

    /**
     * Check if this is a new session (first visit in this browser tab)
     */
    isNewSession: () => {
      return isNew;
    },

    /**
     * Clear all session-scoped data from storage
     */
    clearSessionData: () => {
      if (typeof window !== 'undefined') {
        SESSION_KEYS_TO_CLEAR.forEach((key) => {
          sessionStorage.removeItem(key);
          // Also clear from localStorage if it exists (migration)
          localStorage.removeItem(key);
        });
      }
    },

    /**
     * Initialize session - call this on app startup
     * Returns the session ID and clears any stale localStorage data
     */
    initializeSession: () => {
      if (typeof window !== 'undefined') {
        // Clear any old localStorage data from previous implementation
        // This ensures fresh start for users migrating from localStorage
        SESSION_KEYS_TO_CLEAR.forEach((key) => {
          localStorage.removeItem(key);
        });
      }

      return createSessionManager().getSessionId();
    },
  };
}

// Singleton instance
export const sessionManager = createSessionManager();

// Initialize session immediately on module load (client-side only)
if (typeof window !== 'undefined') {
  sessionManager.initializeSession();
}

// React hook for accessing session info
export function useSession() {
  return {
    sessionId: sessionManager.getSessionId(),
    isNewSession: sessionManager.isNewSession(),
    clearSessionData: sessionManager.clearSessionData,
  };
}
