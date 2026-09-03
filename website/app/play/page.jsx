import { Suspense } from "react";
import GameClient from "../game/GameClient";

export const metadata = {
  title: "Play | 21 Hold'em"
};

export default function PlayPage() {
  return (
    <Suspense fallback={<main className="gameHandoffPage" />}>
      <GameClient />
    </Suspense>
  );
}
