"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { getCookie } from "../profileApi";

const LegacyGame = dynamic(() => import("../../legacy-game/src/views/game"), {
  ssr: false,
  loading: () => (
    <main className="gameHandoffPage" aria-label="Loading 21 Hold'em table">
      <section className="gameHandoffShell">
        <img className="gameHandoffTable" src="/images/optimized/table-hole.webp" alt="" />
      </section>
    </main>
  )
});

export default function GameClient() {
  const searchParams = useSearchParams();
  const [queryClient] = useState(() => new QueryClient());
  const boardId = searchParams.get("boardId") || "";
  const privateCode = searchParams.get("privateCode") || "";
  const token = getCookie("sAuthToken") || "";

  useEffect(() => {
    if (!token) {
      window.location.replace("/login?next=/lobby");
      return;
    }

    if (!boardId) {
      window.location.replace("/lobby");
    }
  }, [boardId, token]);

  const initialEntries = useMemo(() => ([
    {
      pathname: "/play",
      search: typeof window !== "undefined" ? window.location.search : "",
      state: {
        sAuthToken: token,
        iBoardId: boardId,
        sPrivateCode: privateCode,
        fallbackPath: "/lobby"
      }
    }
  ]), [boardId, privateCode, token]);

  return (
    <main className="gameRuntimePage">
      {token && boardId ? (
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>
            <LegacyGame />
          </MemoryRouter>
        </QueryClientProvider>
      ) : null}
    </main>
  );
}
