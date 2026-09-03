"use client";

import { useEffect, useRef } from "react";
import FusionTitle from "./FusionTitle";

export default function ParallaxHero({ gameUrl }) {
  const heroRef = useRef(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) {
      return undefined;
    }

    let frame = 0;

    function setParallax(clientX, clientY) {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) - 0.5;
        const y = ((clientY - rect.top) / rect.height) - 0.5;
        hero.style.setProperty("--parallax-x", x.toFixed(4));
        hero.style.setProperty("--parallax-y", y.toFixed(4));
      });
    }

    function handlePointerMove(event) {
      setParallax(event.clientX, event.clientY);
    }

    function handlePointerLeave() {
      hero.style.setProperty("--parallax-x", "0");
      hero.style.setProperty("--parallax-y", "0");
    }

    hero.addEventListener("pointermove", handlePointerMove);
    hero.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", handlePointerMove);
      hero.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <section className="hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="heroScene" aria-hidden="true">
        <div className="parallaxLayer layerBack">
          <div className="skyWash" />
          <div className="stageRays" />
        </div>
        <div className="parallaxLayer layerTable">
          <div className="tableGlow" />
        </div>
        <div className="parallaxLayer layerChips">
          <div className="chipStack chipStackOne" />
          <div className="chipStack chipStackTwo" />
        </div>
        <div className="parallaxLayer layerCards">
          <div className="cardFan">
            <span className="card cardOne">A</span>
            <span className="card cardTwo">K</span>
            <span className="card cardThree">21</span>
          </div>
        </div>
      </div>

      <nav className="siteNav" aria-label="Main navigation">
        <a className="brand" href="/">
          <span>21</span>
          <strong>Hold'em</strong>
        </a>
        <a className="playLink" href={gameUrl}>Play Game</a>
      </nav>

      <div className="heroBody">
        <div className="heroCopy parallaxCopy">
          <p className="eyebrow">Big Slick Games presents</p>
          <FusionTitle />
          <p>
            Watch blackjack pressure and Texas Hold'em table energy collide,
            then sign in and take your seat at the live game.
          </p>
          <div className="heroActions">
            <a className="primaryAction" href={gameUrl}>Launch Game</a>
            <a className="secondaryAction" href="#how-it-works">See the Hook</a>
          </div>
        </div>
      </div>
    </section>
  );
}
