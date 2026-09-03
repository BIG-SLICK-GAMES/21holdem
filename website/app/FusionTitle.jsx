"use client";

import { useEffect, useState } from "react";

export default function FusionTitle() {
  const [phase, setPhase] = useState("setup");
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setPhase("reveal");
      return undefined;
    }

    setPhase("setup");

    const timers = [
      window.setTimeout(() => setPhase("spin"), 1350),
      window.setTimeout(() => setPhase("reveal"), 3000)
    ];

    return () => {
      timers.forEach(window.clearTimeout);
    };
  }, [runId]);

  function replay() {
    setRunId((currentRunId) => currentRunId + 1);
  }

  return (
    <button
      className={`fusionTitle is-${phase}`}
      type="button"
      onClick={replay}
      aria-label="Replay Blackjack plus Texas Hold'em into 21 Hold'em animation"
      key={runId}
    >
      <span className="fusionEyebrow" aria-live="polite">
        {phase === "reveal" ? "BAM!" : phase === "spin" ? "Spin them together" : "Take"}
      </span>

      <h1 id="hero-title" className="fusionHeading">
        <span className="fusionIngredients" aria-hidden={phase === "reveal"}>
          <span className="sourceTitle sourceBlackjack">Blackjack</span>
          <span className="sourcePlus">+</span>
          <span className="sourceTitle sourceHoldem">Texas Hold'em</span>
        </span>

        <span className="fusionTop" aria-hidden="true">
          <span>21</span>
        </span>

        <span className="chipTornado" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              className="tornadoChip"
              style={{
                "--chip-turn": `${index * 28}deg`,
                "--chip-rise": `${index * -10}px`,
                "--chip-depth": `${42 + (index % 5) * 16}px`
              }}
              key={index}
            />
          ))}
        </span>

        <span className="fusionResult" aria-hidden={phase !== "reveal"}>
          <span className="bamText">BAM!</span>
          <span>21 Hold'em</span>
        </span>
      </h1>

      <span className="fusionHint">Tap to replay</span>
    </button>
  );
}
