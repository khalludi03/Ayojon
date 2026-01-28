// Session utility for mock JWT
export function getSessionFromLocalStorage() {
  // Check if we're in a browser environment
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return null;
  }

  const jwt = localStorage.getItem("mock_jwt");
  if (!jwt) return null;
  try {
    const payload = JSON.parse(atob(jwt));
    // Check JWT expiry
    if (payload.exp && Date.now() > payload.exp) {
      localStorage.removeItem("mock_jwt");
      localStorage.removeItem("last_activity");
      return null;
    }
    // Check inactivity expiry (7 days)
    const lastActivity = parseInt(localStorage.getItem("last_activity") || "0", 10);
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    if (lastActivity && Date.now() - lastActivity > SEVEN_DAYS) {
      localStorage.removeItem("mock_jwt");
      localStorage.removeItem("last_activity");
      return null;
    }
    return payload;
  } catch {
    localStorage.removeItem("mock_jwt");
    localStorage.removeItem("last_activity");
    return null;
  }
}

// Call this on any user activity
export function updateLastActivity() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  localStorage.setItem("last_activity", Date.now().toString());
}
