"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildGameUrl,
  formatShortAmount,
  formatTableAmount,
  getActivePlayers,
  getBlindLabel,
  getLiveTables,
  joinLiveTable
} from "./gameApi";

const PLAYER_OPTIONS = [4, 6, 9];
const BUY_IN_OPTIONS = [1000, 5000, 15000, 20000];

function getBuyInOptions(tables) {
  return Array.from(new Set([
    ...BUY_IN_OPTIONS,
    ...tables.map((table) => Number(table?.nMinBuyIn) || 0)
  ].filter(Boolean))).sort((a, b) => a - b);
}

function getSeatOptions(tables, activeBuyIn) {
  const matchingTables = tables.filter((table) => Number(table?.nMinBuyIn) === Number(activeBuyIn));
  return Array.from(new Set([
    ...PLAYER_OPTIONS,
    ...matchingTables.map((table) => Number(table?.nMaxPlayer) || 0)
  ].filter(Boolean))).sort((a, b) => a - b);
}

function getTableId(table) {
  return table?._id || table?.id || "";
}

function TableSeatPreview({ maxPlayers, activePlayers }) {
  const seatCount = Math.max(Number(maxPlayers) || 0, 0);
  const takenCount = Math.max(Math.min(Number(activePlayers) || 0, seatCount), 0);
  const seats = Array.from({ length: seatCount }, (_, index) => ({
    id: index,
    isTaken: index < takenCount,
    angle: -155 + ((310 / Math.max(seatCount - 1, 1)) * index)
  }));

  return (
    <div className="liveTableThumb liveTableSeatPreview" aria-hidden="true">
      <span className="tableSeatCount">{seatCount} seats</span>
      <div className="perspectiveTable">
        <span className="tableFelt" />
        {seats.map((seat) => (
          <span
            className={`tableSeatDot ${seat.isTaken ? "isTaken" : "isOpen"}`}
            style={{ "--seat-angle": `${seat.angle}deg` }}
            key={seat.id}
          />
        ))}
      </div>
    </div>
  );
}

export default function LobbyPanel({ embedded = false }) {
  const [tables, setTables] = useState([]);
  const [activeSeatCount, setActiveSeatCount] = useState(PLAYER_OPTIONS[0]);
  const [activeBuyIn, setActiveBuyIn] = useState(BUY_IN_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningTableId, setJoiningTableId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setError("");

    getLiveTables("public")
      .then((nextTables) => {
        if (!isMounted) return;
        setTables(nextTables);

        const buyInOptions = getBuyInOptions(nextTables);
        const firstBuyIn = buyInOptions[0] || BUY_IN_OPTIONS[0];
        const seatOptions = getSeatOptions(nextTables, firstBuyIn);

        setActiveBuyIn(firstBuyIn);
        setActiveSeatCount(seatOptions[0] || PLAYER_OPTIONS[0]);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(loadError?.message || "Unable to load live tables.");
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

  const buyInOptions = useMemo(() => getBuyInOptions(tables), [tables]);
  const seatOptions = useMemo(() => getSeatOptions(tables, activeBuyIn), [tables, activeBuyIn]);
  const filteredTables = useMemo(() => (
    tables.filter((table) => (
      Number(table?.nMinBuyIn) === Number(activeBuyIn)
      && Number(table?.nMaxPlayer) === Number(activeSeatCount)
    ))
  ), [activeBuyIn, activeSeatCount, tables]);
  const visibleTables = filteredTables.length
    ? filteredTables
    : tables.filter((table) => Number(table?.nMinBuyIn) === Number(activeBuyIn));

  function handleBuyInChange(event) {
    const nextBuyIn = Number(event.target.value);
    const nextSeatOptions = getSeatOptions(tables, nextBuyIn);

    setActiveBuyIn(nextBuyIn);
    setActiveSeatCount((current) => (
      nextSeatOptions.includes(current) ? current : nextSeatOptions[0] || PLAYER_OPTIONS[0]
    ));
  }

  async function handleJoinTable(table) {
    const tableId = getTableId(table);
    if (!tableId || joiningTableId) return;

    setJoiningTableId(tableId);
    setError("");
    setMessage("");

    try {
      const joinData = await joinLiveTable(tableId);
      const boardId = joinData?.iBoardId || joinData?._id || joinData?.id || "";

      if (!boardId) {
        throw new Error("The table was joined, but no board id was returned.");
      }

      if (joinData?.isTestJoin) {
        setMessage(`Test table joined: ${boardId}`);
        setJoiningTableId("");
        return;
      }

      setMessage("Table joined. Opening game...");
      window.location.assign(buildGameUrl(boardId));
    } catch (joinError) {
      setError(joinError?.message || "Unable to join table.");
      setJoiningTableId("");
    }
  }

  return (
    <section className={`lobbyPanel ${embedded ? "lobbyPanelEmbedded" : ""}`} aria-label="Choose table setup">
      <div className="lobbyControls lobbyControlsOnly lobbyControlsCompact">
        <div className="lobbySelectGroup">
          <select
            className="lobbySelect"
            value={activeSeatCount}
            aria-label="Players"
            onChange={(event) => setActiveSeatCount(Number(event.target.value))}
            disabled={isLoading}
          >
            {seatOptions.map((option) => (
              <option value={option} key={option}>{option} players</option>
            ))}
          </select>
        </div>

        <div className="lobbySelectGroup">
          <select
            className="lobbySelect"
            value={activeBuyIn}
            aria-label="Buy-In"
            onChange={handleBuyInChange}
            disabled={isLoading}
          >
            {buyInOptions.map((option) => (
              <option value={option} key={option}>{formatShortAmount(option)} buy-in</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <p className="lobbyMessage">Loading live tables...</p> : null}
      {error ? <p className="lobbyMessage isError" role="alert">{error}</p> : null}
      {message ? <p className="lobbyMessage" role="status">{message}</p> : null}

      {!isLoading && !error ? (
        visibleTables.length ? (
          <div className="liveTableList" aria-label="Available live tables">
            {visibleTables.map((table, index) => {
              const tableId = getTableId(table);
              const activePlayers = getActivePlayers(table);
              const maxPlayers = Number(table?.nMaxPlayer) || activeSeatCount;
              const openSeats = Math.max(maxPlayers - activePlayers, 0);
              const liveTableCount = Math.max(Number(table?.nLiveTableCount) || 0, 1);
              const isJoining = joiningTableId === tableId;

              return (
                <article className="liveTableRow" style={{ "--row-delay": `${index * 55}ms` }} key={tableId || index}>
                  <TableSeatPreview maxPlayers={maxPlayers} activePlayers={activePlayers} />
                  <div className="liveTableMain">
                    <h2>{table?.sName || `${formatShortAmount(table?.nMinBuyIn)} Table`}</h2>
                    <div className="liveTablePills">
                      <span>{formatTableAmount(table?.nMinBuyIn)} buy-in</span>
                      <span>{getBlindLabel(table)} blinds</span>
                      <span className={activePlayers ? "isHot" : ""}>{activePlayers}/{maxPlayers} players</span>
                      <span>{openSeats} open</span>
                      <span>{liveTableCount} table{liveTableCount === 1 ? "" : "s"}</span>
                    </div>
                  </div>
                  <button
                    className="liveTableJoin"
                    type="button"
                    onClick={() => handleJoinTable(table)}
                    disabled={!tableId || !!joiningTableId}
                  >
                    {isJoining ? "Joining..." : "Join"}
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="liveTableEmpty">No matching tables are available for this setup.</p>
        )
      ) : null}
    </section>
  );
}
