"use client";

import { useEffect, useState } from "react";
import { fetchProfile, formatChips, logoutProfile, updateProfileSettings } from "../profileApi";

export default function ProfileClient() {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    fetchProfile()
      .then((nextProfile) => {
        if (isMounted) {
          setProfile(nextProfile);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError("Sign in to view your profile.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }
  }, []);

  function handleThemeChange() {
    setTheme((current) => {
      const nextTheme = current === "light" ? "dark" : "light";
      window.localStorage.setItem("theme", nextTheme);
      return nextTheme;
    });
  }

  async function handleSettingChange(key, checked) {
    if (!profile || isSaving) return;

    const nextProfile = { ...profile, [key]: checked };
    setProfile(nextProfile);
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await updateProfileSettings({
        bSoundEnabled: nextProfile.soundEnabled,
        bMusicEnabled: nextProfile.musicEnabled
      });
      setMessage("Settings saved.");
    } catch (settingError) {
      setError(settingError?.message || "Unable to update settings.");
      setProfile(profile);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLogout() {
    await logoutProfile();
    window.location.assign("/");
  }

  const winRate = profile?.gamesPlayed ? Math.round((profile.gamesWon / profile.gamesPlayed) * 100) : 0;

  return (
    <main className="profilePage" data-theme={theme} aria-labelledby="profile-title">
      <header className="profileTopBar">
        <a className="profileBrand" href="/lobby">
          <img src="/images/optimized/chip.webp" alt="" />
        </a>
        <nav className="profileNav" aria-label="Profile navigation">
          <a href="/lobby">Play</a>
          {!profile && !isLoading ? (
            <>
              <a href="/login">Login</a>
              <a href="/signup">Sign Up</a>
            </>
          ) : null}
        </nav>
      </header>

      <section className="profileShell">
        {isLoading ? (
          <div className="profileStateCard">Loading profile...</div>
        ) : profile ? (
          <>
            <section className="profileHeroCard">
              <div className="profileAvatar">
                {profile.avatar ? <img src={profile.avatar} alt="" /> : <span>{profile.username.slice(0, 1).toUpperCase()}</span>}
              </div>
              <div>
                <p className="sectionKicker">{profile.isMember ? "Member account" : "Player account"}</p>
                <h1 id="profile-title">{profile.username}</h1>
                {profile.email ? <p>{profile.email}</p> : null}
              </div>
              <div className="profileBankroll">
                <span>Bankroll</span>
                <strong>{formatChips(profile.bankroll)}</strong>
              </div>
            </section>

            <section className="profileStatsGrid" aria-label="Player stats">
              <article>
                <span>Hands Played</span>
                <strong>{formatChips(profile.gamesPlayed)}</strong>
              </article>
              <article>
                <span>Hands Won</span>
                <strong>{formatChips(profile.gamesWon)}</strong>
              </article>
              <article>
                <span>Win Rate</span>
                <strong>{winRate}%</strong>
              </article>
              <article>
                <span>Total Winnings</span>
                <strong>{formatChips(profile.totalWinnings)}</strong>
              </article>
              <article>
                <span>Total Bet</span>
                <strong>{formatChips(profile.totalBet)}</strong>
              </article>
              <article>
                <span>Daily Streak</span>
                <strong>{formatChips(profile.dailyRewardStreak)}</strong>
              </article>
            </section>

            <section className="profileSettingsCard" aria-label="Profile settings">
              <div>
                <p className="sectionKicker">Settings</p>
                <h2>Game Preferences</h2>
              </div>
              <label className="profileSwitch">
                <span>Sound</span>
                <input
                  type="checkbox"
                  checked={profile.soundEnabled}
                  onChange={(event) => handleSettingChange("soundEnabled", event.target.checked)}
                />
              </label>
              <label className="profileSwitch">
                <span>Music</span>
                <input
                  type="checkbox"
                  checked={profile.musicEnabled}
                  onChange={(event) => handleSettingChange("musicEnabled", event.target.checked)}
                />
              </label>
              <div className="profileThemeSetting">
                <span>Theme</span>
                <button
                  className="themeToggle"
                  type="button"
                  onClick={handleThemeChange}
                  aria-label={`Switch to ${theme === "light" ? "dark blue" : "cream gold"} theme`}
                  aria-pressed={theme === "dark"}
                >
                  <span className="themeSwatch themeSwatchDark" aria-hidden="true" />
                  <span className="themeSwatch themeSwatchLight" aria-hidden="true" />
                  <span className="themeKnob" aria-hidden="true" />
                </button>
              </div>
              {message ? <p className="profileMessage">{message}</p> : null}
              {error ? <p className="profileMessage isError">{error}</p> : null}
            </section>

            <div className="profileActions">
              <a className="primaryAction largeAction" href="/lobby">Play Now</a>
              <button className="secondaryAction" type="button" onClick={handleLogout}>Logout</button>
            </div>
          </>
        ) : (
          <div className="profileStateCard">
            <p>{error || "Sign in to view your profile."}</p>
            <a className="primaryAction" href="/login">Login</a>
          </div>
        )}
      </section>
    </main>
  );
}
