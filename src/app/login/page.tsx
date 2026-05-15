import type { Metadata } from "next";
import { redirect } from "next/navigation";
import {
  DEFAULT_AUTHENTICATED_PATH,
  isProtectedPath,
} from "@/lib/auth-session";
import { redirectIfAuthenticated, signInWithPassword } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Login | Aptitude",
  description: "Sign in to the Aptitude Registry audit console.",
};

type Props = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  await redirectIfAuthenticated();
  const { error, next } = await searchParams;
  const nextPath =
    next && next.startsWith("/") && isProtectedPath(next)
      ? next
      : DEFAULT_AUTHENTICATED_PATH;

  async function handleLogin(formData: FormData) {
    "use server";

    const signedIn = await signInWithPassword(formData.get("password"));
    if (!signedIn) redirect("/login?error=invalid");
    redirect(nextPath);
  }

  return (
    <div className="login-page">
      <section className="login-hero" aria-labelledby="login-title">
        <div className="login-copy">
          <p className="eyebrow">Audit Console</p>
          <h1 id="login-title" className="login-title">
            Secure access for governed skill activity.
          </h1>
          <p className="login-description">
            Sign in to review skills, registry events, policy decisions, and
            audit activity.
          </p>
        </div>

        <form className="login-panel" aria-label="Sign in" action={handleLogin}>
          <div className="login-panel__header">
            <span className="login-panel__status" aria-hidden="true" />
            <div>
              <h2>Sign in</h2>
            </div>
          </div>

          <label className="login-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="operator@aptitude.dev"
              required
            />
          </label>

          <label className="login-field">
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="password"
              required
            />
          </label>

          {error === "invalid" && (
            <p className="login-error" role="alert">
              Sign-in failed. Check the operator password and try again.
            </p>
          )}

          <div className="login-row">
            <label className="login-checkbox">
              <input name="remember" type="checkbox" />
              <span>Remember this device</span>
            </label>
            <a href="mailto:security@aptitude.dev">Need access?</a>
          </div>

          <button className="login-submit" type="submit">
            Continue
          </button>
        </form>
      </section>
    </div>
  );
}
