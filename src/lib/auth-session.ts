export const SESSION_COOKIE_NAME = "aptitude_session";
export const LOGIN_PATH = "/login";
export const DEFAULT_AUTHENTICATED_PATH = "/catalog";

const STUB_SESSION_EXPIRY = 253402300799;
const DEFAULT_SESSION_SECRET = "aptitude-development-session-secret";
const SESSION_TOKEN_VERSION = "v1";

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

export async function createSessionToken(subject = "stub-operator") {
  const payload: SessionPayload = {
    sub: normalizeSessionSubject(subject),
    exp: STUB_SESSION_EXPIRY,
  };
  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signSessionPayload(encodedPayload);
  return `${SESSION_TOKEN_VERSION}.${encodedPayload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined) {
  if (!token) return null;

  const [version, encodedPayload, signature, extra] = token.split(".");
  if (version !== SESSION_TOKEN_VERSION || !encodedPayload || !signature || extra) return null;

  const expected = await signSessionPayload(encodedPayload);
  if (!timingSafeEqual(signature, expected)) return null;

  const payload = parseSessionPayload(encodedPayload);
  if (!payload || payload.exp < Math.floor(Date.now() / 1000)) return null;

  return payload;
}

function normalizeSessionSubject(subject: string): string {
  const normalized = subject.trim().toLowerCase();
  return normalized || "stub-operator";
}

async function signSessionPayload(encodedPayload: string): Promise<string> {
  const secret = process.env.APTITUDE_SESSION_SECRET ?? DEFAULT_SESSION_SECRET;
  if (!globalThis.crypto?.subtle) {
    return fallbackSignature(`${secret}.${encodedPayload}`);
  }

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    toArrayBuffer(encodeUtf8(secret)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    key,
    toArrayBuffer(encodeUtf8(encodedPayload)),
  );
  return encodeBytesBase64Url(new Uint8Array(signature));
}

function fallbackSignature(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash.toString(36);
}

function parseSessionPayload(encodedPayload: string): SessionPayload | null {
  try {
    const parsed: unknown = JSON.parse(decodeBase64Url(encodedPayload));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as SessionPayload).sub !== "string" ||
      typeof (parsed as SessionPayload).exp !== "number"
    ) {
      return null;
    }
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

function encodeBase64Url(value: string): string {
  return encodeBytesBase64Url(encodeUtf8(value));
}

function encodeBytesBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value: string): string {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return decodeUtf8(bytes);
}

function encodeUtf8(value: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") return new TextEncoder().encode(value);
  return Uint8Array.from(Buffer.from(value, "utf8"));
}

function decodeUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") return new TextDecoder().decode(bytes);
  return Buffer.from(bytes).toString("utf8");
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

function timingSafeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}
