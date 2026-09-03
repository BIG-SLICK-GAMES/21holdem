"use client";

import { useSearchParams } from "next/navigation";

export default function GameClient() {
  const searchParams = useSearchParams();
  const boardId = searchParams.get("boardId") || "";

  return (
    <main className="gameHandoffPage" aria-labelledby="game-handoff-title">
      <div className="gameHandoffTopBar">
        <a className="profileBrand" href="/lobby" aria-label="Back to 21 Hold'em lobby">
          <img src="/images/optimized/chip.webp" alt="" />
        </a>
        <a className="gameHandoffExit" href="/lobby">Lobby</a>
      </div>

      <section className="gameHandoffShell">
        <img className="gameHandoffTable" src="/images/optimized/table-hole.webp" alt="" />
        <div className="gameHandoffCard">
          <p className="sectionKicker">Table Joined</p>
          <h1 id="game-handoff-title">Game Table Loading</h1>
          <p>
            The live board has been created through the backend. The Phaser table runtime is the next piece to port into this new frontend shell.
          </p>
          {boardId ? (
            <code>Board ID: {boardId}</code>
          ) : (
            <code>No board id was supplied.</code>
          )}
        </div>
      </section>
    </main>
  );
}
