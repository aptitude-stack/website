import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  DEFAULT_AUTHENTICATED_PATH,
  LOGIN_PATH,
  SESSION_COOKIE_NAME,
  createSessionToken,
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

export async function signInWithStubSession() {
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: await createSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return true;
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function redirectIfAuthenticated() {
  const session = await getSession();
  if (session) redirect(DEFAULT_AUTHENTICATED_PATH);
}
