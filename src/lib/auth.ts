import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  SESSION_COOKIE_NAME,
  createSessionToken,
  getOperatorPassword,
  verifySessionToken,
} from "@/lib/auth-session";

export async function getSession() {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
}

export async function requireSession() {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

export async function signInWithPassword(password: FormDataEntryValue | null) {
  const expectedPassword = getOperatorPassword();
  if (!expectedPassword || typeof password !== "string" || password !== expectedPassword) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: await createSessionToken("operator"),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) redirect(DEFAULT_AUTHENTICATED_PATH);
}
