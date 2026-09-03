"use client";

import { useEffect, useState } from "react";
import { fetchProfile, formatChips, getCookie } from "./profileApi";

export default function HeaderProfile() {
  const [profile, setProfile] = useState(null);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const token = getCookie("sAuthToken");
    setHasToken(!!token);

    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    fetchProfile()
      .then((nextProfile) => {
        if (isMounted) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <a className={`topBarProfileLink ${profile ? "isSignedIn" : ""}`} href={hasToken ? "/profile" : "/login"} aria-label={hasToken ? "Open profile" : "Sign in"}>
      <span className="topBarProfile" aria-hidden="true" />
      {profile ? (
        <span className="topBarProfileText">
          <span>{formatChips(profile.bankroll)}</span>
        </span>
      ) : null}
    </a>
  );
}
