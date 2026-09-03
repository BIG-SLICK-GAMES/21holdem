"use client";

import { useMemo, useState } from "react";
import { createTestProfile, normalizeProfile, storeTestProfile } from "./profileApi";

const REMEMBER_KEY = "bsg:website-remember-login";
const EMAIL_KEY = "bsg:website-remember-email";

function stripApiSuffix(url = "") {
  return String(url || "")
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/api\/?$/i, "")
    .replace(/\/$/, "");
}

function getApiRoot() {
  const configuredUrl = process.env.NEXT_PUBLIC_AUTH_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (configuredUrl) {
    try {
      return stripApiSuffix(new URL(configuredUrl).toString());
    } catch {
      return "";
    }
  }

  if (typeof window === "undefined") {
    return "";
  }

  return window.location.origin;
}

function getCookieParts(rememberSession) {
  if (typeof window === "undefined") {
    return [];
  }

  const parts = ["Path=/", "SameSite=Lax"];

  if (window.location.protocol === "https:") {
    parts.push("Secure");
  }

  if (window.location.hostname === "21-holdem.com" || window.location.hostname.endsWith(".21-holdem.com")) {
    parts.push("Domain=.21-holdem.com");
  }

  if (rememberSession) {
    parts.push(`Max-Age=${30 * 24 * 60 * 60}`);
  }

  return parts;
}

function extractToken(payload, response) {
  const token = payload?.data?.authorization
    || payload?.data?.token
    || payload?.token
    || response.headers.get("authorization")
    || response.headers.get("Authorization")
    || "";

  return String(token).trim().replace(/^Bearer\s+/i, "");
}

function storeAuthToken(token, rememberSession) {
  document.cookie = `sAuthToken=${encodeURIComponent(token)}; ${getCookieParts(rememberSession).join("; ")}`;
}

function getSavedEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(EMAIL_KEY) || "";
}

export default function LoginPanel({ mode = "login", gameUrl = "/lobby" }) {
  const isSignup = mode === "signup";
  const [displayName, setDisplayName] = useState("");
  const [identifier, setIdentifier] = useState(() => getSavedEmail());
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    const stored = window.localStorage.getItem(REMEMBER_KEY);
    return stored === null ? true : stored === "true";
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiRoot = useMemo(() => getApiRoot(), []);
  const title = isSignup ? "Create your player account" : "Enter the table";
  const submitLabel = isSignup ? "Create Account" : "Sign In";
  const endpoint = isSignup ? "/api/v1/auth/register" : "/api/v1/auth/login";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setStatus("");

    if (isSignup && !displayName.trim()) {
      setError("Enter your player name.");
      return;
    }

    if (!identifier.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!apiRoot) {
      setError("Auth service is not configured.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiRoot}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          sEmail: identifier.trim(),
          sPassword: password,
          sUserName: displayName.trim()
        })
      });

      let payload = {};

      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      const token = extractToken(payload, response);

      if (isSignup && response.ok && !token) {
        setStatus(payload?.message || "Account created. Check your email to verify it, then sign in.");
        return;
      }

      if (!response.ok || !token) {
        setError(payload?.message || `${submitLabel} failed.`);
        return;
      }

      storeAuthToken(token, rememberSession);

      if (rememberSession) {
        window.localStorage.setItem(REMEMBER_KEY, "true");
        window.localStorage.setItem(EMAIL_KEY, identifier.trim());
      } else {
        window.localStorage.setItem(REMEMBER_KEY, "false");
        window.localStorage.removeItem(EMAIL_KEY);
      }

      setStatus("Signed in. Opening the lobby...");
      window.location.assign(gameUrl);
    } catch {
      setError("Auth service is unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleGoogleSignup() {
    setError("");

    if (!apiRoot) {
      setError("Google signup service is not configured.");
      return;
    }

    const returnTo = new URL("/auth/callback", window.location.origin);
    returnTo.searchParams.set("next", gameUrl);

    const googleUrl = new URL(`${apiRoot}/api/v1/auth/google`);
    googleUrl.searchParams.set("mode", isSignup ? "signup" : "login");
    googleUrl.searchParams.set("returnTo", returnTo.toString());
    googleUrl.searchParams.set("autoVerify", "true");
    googleUrl.searchParams.set("remember", rememberSession ? "true" : "false");

    window.location.assign(googleUrl.toString());
  }

  async function handleTestLogin() {
    setError("");
    setStatus("");

    if (!apiRoot) {
      setError("Auth service is not configured.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiRoot}/api/v1/auth/test-login`, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      });
      const payload = await response.json().catch(() => ({}));
      const token = extractToken(payload, response);

      if (!response.ok || !token) {
        setError(payload?.message || "Test login failed.");
        return;
      }

      storeTestProfile({ ...createTestProfile(), ...normalizeProfile(payload), isTestProfile: true });
      storeAuthToken(token, rememberSession);

      if (rememberSession) {
        window.localStorage.setItem(REMEMBER_KEY, "true");
        window.localStorage.setItem(EMAIL_KEY, payload?.data?.sEmail || "test@21holdem.local");
      } else {
        window.localStorage.setItem(REMEMBER_KEY, "false");
        window.localStorage.removeItem(EMAIL_KEY);
      }

      setStatus("Test account loaded. Opening the lobby...");
      window.location.assign(gameUrl);
    } catch {
      setError("Test login service is unavailable.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="authPage" data-theme="dark" aria-labelledby="auth-title">
      <section className="authShell">
        <a className="authBrand" href="/">
          <img src="/images/optimized/chip.webp" alt="" />
          <span>21 Hold'em</span>
        </a>

        <div className="authCard">
          <div className="authIntro">
            <p className="sectionKicker">{isSignup ? "New player" : "Player login"}</p>
            <h1 id="auth-title">{title}</h1>
            <p>
              {isSignup
                ? "Sign up with Google for automatic verification, or create an account with email."
                : "Use your player account to continue into the 21 Hold'em lobby."}
            </p>
          </div>

          <button className="googleAuthButton" type="button" onClick={handleGoogleSignup}>
            <span aria-hidden="true">G</span>
            {isSignup ? "Sign Up With Google" : "Continue With Google"}
          </button>

          <button className="testAuthButton" type="button" onClick={handleTestLogin}>
            Use Test Login
          </button>

          <div className="authDivider"><span>or</span></div>

          <form className="loginForm" onSubmit={handleSubmit} noValidate>
            {isSignup ? (
              <label>
                <span>Player name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                />
              </label>
            ) : null}

            <label>
              <span>Email</span>
              <input
                type="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                autoComplete="email"
                inputMode="email"
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
            </label>

            <label className="rememberRow">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(event) => setRememberSession(event.target.checked)}
              />
              <span>Remember this device</span>
            </label>

            {error && <p className="loginMessage isError" role="alert">{error}</p>}
            {status && <p className="loginMessage isSuccess" role="status">{status}</p>}

            <button className="loginSubmit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Working..." : submitLabel}
            </button>
          </form>

          <p className="authSwitch">
            {isSignup ? "Already have an account?" : "Need an account?"}{" "}
            <a href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Sign up"}</a>
          </p>
        </div>
      </section>
    </main>
  );
}
