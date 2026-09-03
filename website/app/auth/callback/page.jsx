"use client";

import { useEffect, useState } from "react";

function getCookieParts(rememberSession) {
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

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("Verifying your sign in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const token = params.get("token") || params.get("authorization") || hashParams.get("token") || "";
    const error = params.get("error") || hashParams.get("error") || "";
    const next = params.get("next") || "/lobby";
    const remember = params.get("remember") !== "false";

    if (error) {
      setMessage("Google sign in failed. Please try again.");
      return;
    }

    if (!token) {
      setMessage("No sign in token was returned.");
      return;
    }

    document.cookie = `sAuthToken=${encodeURIComponent(token.replace(/^Bearer\s+/i, ""))}; ${getCookieParts(remember).join("; ")}`;
    window.location.replace(next);
  }, []);

  return (
    <main className="authPage" data-theme="dark" aria-labelledby="callback-title">
      <section className="authShell authShellCompact">
        <a className="authBrand" href="/">
          <img src="/images/generated-standalone/chip.png" alt="" />
          <span>21 Hold'em</span>
        </a>
        <div className="authCard">
          <p className="sectionKicker">Google account</p>
          <h1 id="callback-title">Signing you in</h1>
          <p>{message}</p>
          <a className="authTextLink" href="/login">Back to login</a>
        </div>
      </section>
    </main>
  );
}

