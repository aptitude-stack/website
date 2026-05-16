export const SESSION_COOKIE_NAME = "aptitude_session";
export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/catalog";

const STUB_SESSION_TOKEN = "aptitude-stub-session";
const STUB_SESSION_SUBJECT = "stub-operator";
const STUB_SESSION_EXPIRY = 253402300799;

type SessionPayload = {
  sub: string;
  exp: number;
};

export function isProtectedPath(pathname: string) {
  return (
    pathname === "/catalog" ||
    pathname.startsWith("/catalog/") ||
    pathname === "/skills" ||
    pathname.startsWith("/skills/") ||
    pathname === "/audit" ||
    pathname.startsWith("/audit/") ||
    pathname === "/api/search" ||
    pathname === "/api/star-events"
  );
}

export function authIsConfigured() {
  return true;
}

export async function createSessionToken(_subject?: string) {
  return STUB_SESSION_TOKEN;
}

export async function verifySessionToken(token: string | undefined) {
  if (token !== STUB_SESSION_TOKEN) return null;

  return {
    sub: STUB_SESSION_SUBJECT,
    exp: STUB_SESSION_EXPIRY,
  };
}
