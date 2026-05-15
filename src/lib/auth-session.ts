export const SESSION_COOKIE_NAME = "aptitude_session";
export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/catalog";

const SESSION_TTL_SECONDS = 60 * 60 * 8;
const DEV_OPERATOR_PASSWORD = "aptitude-dev";
const DEV_SESSION_SECRET = "aptitude-local-session-secret";

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
    pathname === "/api/search"
  );
}

export function getOperatorPassword() {
  const configured = process.env.APTITUDE_OPERATOR_PASSWORD;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return DEV_OPERATOR_PASSWORD;
  return null;
}

export function authIsConfigured() {
  return Boolean(getOperatorPassword() && getSessionSecret());
}

export async function createSessionToken(subject: string) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("Session secret is not configured");

  const payload: SessionPayload = {
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await sign(encodedPayload, secret);
  return `${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const secret = getSessionSecret();
  if (!secret) return null;

  const [encodedPayload, signature, extra] = token.split(".");
  if (!encodedPayload || !signature || extra !== undefined) return null;

  const expectedSignature = await sign(encodedPayload, secret);
  if (!timingSafeEqual(signature, expectedSignature)) return null;

  let payload: SessionPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload)) as SessionPayload;
  } catch {
    return null;
  }

  if (!payload.sub || !payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function getSessionSecret() {
  const configured = process.env.APTITUDE_SESSION_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV !== "production") return DEV_SESSION_SECRET;
  return null;
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return base64UrlEncodeBytes(new Uint8Array(signature));
}

function base64UrlEncode(value: string) {
  return base64UrlEncodeBytes(new TextEncoder().encode(value));
}

function base64UrlEncodeBytes(value: Uint8Array) {
  return btoa(String.fromCharCode(...value))
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(value: string) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const decoded = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(decoded, (char) => char.charCodeAt(0)));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let i = 0; i < left.length; i += 1) {
    result |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }
  return result === 0;
}
