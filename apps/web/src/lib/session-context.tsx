import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { getSessionFromLocalStorage, updateLastActivity } from "./session";

interface SessionData {
  email: string;
  name: string;
  avatar: string;
  exp?: number;
  iat?: number;
}

interface SessionContextType {
  session: SessionData | null;
  setSession: (session: SessionData | null) => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }) {
  const [session, setSession] = useState(() => {
    // Only get session on client-side
    if (typeof window === "undefined") return null;
    return getSessionFromLocalStorage();
  });


  // Listen for changes to localStorage (e.g., sign in/out in other tabs)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = () => setSession(getSessionFromLocalStorage());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Update last activity on user actions
  useEffect(() => {
    if (typeof window === "undefined") return;

    const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];
    const activityHandler = () => {
      if (getSessionFromLocalStorage()) {
        updateLastActivity();
      }
    };
    activityEvents.forEach((event) => window.addEventListener(event, activityHandler));
    // Set initial activity if session exists
    if (getSessionFromLocalStorage()) {
      updateLastActivity();
    }
    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, activityHandler));
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, setSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}