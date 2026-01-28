import { getSessionFromLocalStorage } from "@/lib/session";

// List of protected route paths
const PROTECTED_PATHS = ["/dashboard"];

export function isRouteProtected(path: string) {
  return PROTECTED_PATHS.includes(path);
}

export function getClientSession() {
  return getSessionFromLocalStorage();
}
