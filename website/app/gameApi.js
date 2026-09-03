"use client";

import { getCookie, isTestAuthToken, stripApiSuffix } from "./profileApi";

const PLAYER_OPTIONS = [4, 6, 9];
const BUY_IN_OPTIONS = [1000, 5000, 15000, 20000];

const MOCK_TABLES = BUY_IN_OPTIONS.flatMap((buyIn, buyInIndex) => (
  PLAYER_OPTIONS.map((players, playerIndex) => ({
    _id: `test-proto-${buyIn}-${players}`,
    sName: `${buyIn / 1000}K ${players}-Seat`,
    nMinBet: buyIn === 1000 ? 5 : buyIn === 5000 ? 50 : buyIn === 15000 ? 150 : 500,
    nMinBuyIn: buyIn,
    nMaxPlayer: players,
    nLiveTableCount: 1 + ((buyInIndex + playerIndex) % 3),
    nLiveParticipants: Math.min(players - 1, 1 + ((buyInIndex * 2 + playerIndex) % players)),
    nActivePlayers: Math.min(players - 1, 1 + ((buyInIndex + playerIndex) % players)),
    isTestTable: true
  }))
));

export function getGameApiRoot() {
  const configuredUrl = process.env.NEXT_PUBLIC_GAME_API_BASE_URL
    || process.env.NEXT_PUBLIC_AUTH_API_BASE_URL
    || process.env.NEXT_PUBLIC_API_BASE_URL;

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

export function getGameClientUrl() {
  return process.env.NEXT_PUBLIC_GAME_CLIENT_URL || "/play";
}

export function getActivePlayers(table) {
  return Number(table?.nLiveParticipants) || Number(table?.nActivePlayers) || 0;
}

export function formatTableAmount(amount) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Number(amount) || 0);
}

export function formatShortAmount(amount) {
  const value = Number(amount) || 0;
  return value >= 1000 ? `${value / 1000}k` : String(value);
}

export function getBlindLabel(table) {
  const smallBlind = Number(table?.nMinBet) || 0;
  return `${formatTableAmount(smallBlind)} / ${formatTableAmount(smallBlind * 2)}`;
}

function getArrayPayload(payload) {
  return Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
}

function sortTablesByPriority(a, b) {
  const tableCountDiff = Number(b?.nLiveTableCount || 0) - Number(a?.nLiveTableCount || 0);
  if (tableCountDiff) return tableCountDiff;

  const playerDiff = getActivePlayers(b) - getActivePlayers(a);
  if (playerDiff) return playerDiff;

  const buyInDiff = Number(a?.nMinBuyIn || 0) - Number(b?.nMinBuyIn || 0);
  if (buyInDiff) return buyInDiff;

  return String(a?.sName || "").localeCompare(String(b?.sName || ""));
}

async function requestGameApi(path, options = {}) {
  const token = getCookie("sAuthToken");

  if (isTestAuthToken(token)) {
    return null;
  }

  const apiRoot = getGameApiRoot();
  if (!apiRoot || !token) {
    throw new Error("Sign in is required.");
  }

  const response = await fetch(`${apiRoot}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      authorization: `Bearer ${token}`,
      ...(options.headers || {})
    },
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || (payload?.status && Number(payload.status) >= 400)) {
    throw new Error(payload?.message || "Game service request failed.");
  }

  return payload;
}

export async function getLiveTables(eBoardType = "public") {
  if (isTestAuthToken(getCookie("sAuthToken"))) {
    return MOCK_TABLES;
  }

  const params = new URLSearchParams();
  if (eBoardType) params.set("eBoardType", eBoardType);
  const query = params.toString();
  const payload = await requestGameApi(`/api/v1/poker/board/list${query ? `?${query}` : ""}`);

  return getArrayPayload(payload).filter(Boolean).sort(sortTablesByPriority);
}

export async function joinLiveTable(iProtoId) {
  const token = getCookie("sAuthToken");

  if (isTestAuthToken(token)) {
    return { iBoardId: `test-board-${iProtoId}`, isTestJoin: true };
  }

  const payload = await requestGameApi("/api/v1/poker/board/join", {
    method: "POST",
    body: JSON.stringify({ iProtoId })
  });

  return payload?.data || payload || {};
}

export function buildGameUrl(boardId) {
  const gameClientUrl = getGameClientUrl();
  const params = new URLSearchParams();
  if (boardId) params.set("boardId", boardId);
  params.set("source", "website");

  if (/^https?:\/\//i.test(gameClientUrl)) {
    const url = new URL(gameClientUrl);
    params.forEach((value, key) => url.searchParams.set(key, value));
    return url.toString();
  }

  return `${gameClientUrl}${gameClientUrl.includes("?") ? "&" : "?"}${params.toString()}`;
}
