import { Suspense } from "react";
import GameClient from "./GameClient";

export const metadata = {
  title: "Game Table | 21 Hold'em"
};

export default function GamePage() {
  return (
    <Suspense fallback={<main className="gameHandoffPage" />}>
      <GameClient />
    </Suspense>
  );
}
