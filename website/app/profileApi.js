"use client";

export const TEST_AUTH_TOKEN = "test-21holdem-local-token";
export const TEST_PROFILE_KEY = "21holdem.testProfile";

export function createTestProfile(overrides = {}) {
  return {
    id: "test-player-21holdem",
    username: "Test Player",
    email: "test@21holdem.local",
    avatar: "",
    bankroll: 78593,
    isMember: true,
    gamesPlayed: 107,
    gamesWon: 22,
    gamesLost: 85,
    totalBet: 16976,
    totalWinnings: 30211,
    withdrawable: 0,
    dailyRewardStreak: 1,
    soundEnabled: true,
    musicEnabled: true,
    isTestProfile: true,
    ...overrides
  };
}

export function isTestAuthToken(token) {
  return String(token || "") === TEST_AUTH_TOKEN;
}

export function storeTestProfile(profile = createTestProfile()) {
  window.localStorage.setItem(TEST_PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export function getTestProfile() {
  if (typeof window === "undefined") {
    return createTestProfile();
  }

  const savedProfile = window.localStorage.getItem(TEST_PROFILE_KEY);

  if (!savedProfile) {
    return storeTestProfile();
  }

  try {
    return { ...createTestProfile(), ...JSON.parse(savedProfile), isTestProfile: true };
  } catch {
    return storeTestProfile();
  }
}

export function stripApiSuffix(url = "") {
  return String(url || "")
    .replace(/\/api\/v1\/?$/i, "")
    .replace(/\/api\/?$/i, "")
    .replace(/\/$/, "");
}

export function getApiRoot() {
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

export function getCookie(name) {
  if (typeof document === "undefined") {
    return "";
  }

  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : "";
}

export function clearAuthToken() {
  document.cookie = "sAuthToken=; Path=/; Max-Age=0; SameSite=Lax";
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(TEST_PROFILE_KEY);
  }
}

export function formatChips(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(value) || 0);
}

export function normalizeProfile(payload) {
  const profile = payload?.data || payload || {};

  return {
    id: profile._id || profile.id || "",
    username: profile.sUserName || profile.sDisplayName || profile.sEmail || "Player",
    email: profile.sEmail || "",
    avatar: profile.sAvatar || "",
    bankroll: Number(profile.nChips) || 0,
    isMember: !!profile.bIsMember,
    gamesPlayed: Number(profile.nGamePlayed) || 0,
    gamesWon: Number(profile.nGameWon) || 0,
    gamesLost: Number(profile.nGameLost) || 0,
    totalBet: Number(profile.nTotalBetAmount) || 0,
    totalWinnings: Number(profile.nTotalWinningAmount) || 0,
    withdrawable: Number(profile.nWithdrawable) || 0,
    dailyRewardStreak: Number(profile.nDailyRewardStreak) || 0,
    activeBoardIds: Array.isArray(profile.aPokerBoard) ? profile.aPokerBoard.map(String) : [],
    soundEnabled: profile.bSoundEnabled !== false,
    musicEnabled: profile.bMusicEnabled !== false
  };
}

export async function fetchProfile() {
  const apiRoot = getApiRoot();
  const token = getCookie("sAuthToken");

  if (isTestAuthToken(token)) {
    return getTestProfile();
  }

  if (!apiRoot || !token) {
    return null;
  }

  const response = await fetch(`${apiRoot}/api/v1/profile`, {
    headers: {
      Accept: "application/json",
      authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to load profile.");
  }

  return normalizeProfile(payload);
}

export async function updateProfileSettings(settings) {
  const apiRoot = getApiRoot();
  const token = getCookie("sAuthToken");

  if (isTestAuthToken(token)) {
    const profile = getTestProfile();
    storeTestProfile({
      ...profile,
      soundEnabled: settings.bSoundEnabled ?? profile.soundEnabled,
      musicEnabled: settings.bMusicEnabled ?? profile.musicEnabled
    });
    return { success: true, data: getTestProfile() };
  }

  if (!apiRoot || !token) {
    throw new Error("Sign in is required.");
  }

  const response = await fetch(`${apiRoot}/api/v1/profile/setting`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`
    },
    body: JSON.stringify(settings)
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.message || "Unable to update settings.");
  }

  return payload;
}

export async function logoutProfile() {
  const apiRoot = getApiRoot();
  const token = getCookie("sAuthToken");

  if (apiRoot && token) {
    await fetch(`${apiRoot}/api/v1/profile/logout`, {
      headers: {
        Accept: "application/json",
        authorization: `Bearer ${token}`
      },
      cache: "no-store"
    }).catch(() => {});
  }

  clearAuthToken();
}
