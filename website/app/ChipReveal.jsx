"use client";

import { useEffect, useRef, useState } from "react";
import HeaderProfile from "./HeaderProfile";
import LobbyPanel from "./LobbyPanel";
import { fetchProfile, getCookie } from "./profileApi";

export default function ChipReveal() {
  const currentYear = new Date().getFullYear();
  const [theme, setTheme] = useState("dark");
  const [visibleCards, setVisibleCards] = useState([]);
  const [whatIsVisible, setWhatIsVisible] = useState(false);
  const [messageStep, setMessageStep] = useState(0);
  const [activeMenuSlot, setActiveMenuSlot] = useState("how-to-play");
  const [rewardPrize, setRewardPrize] = useState(null);
  const [isRewardSpinning, setIsRewardSpinning] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isProfileChecked, setIsProfileChecked] = useState(false);
  const cardRefs = useRef([]);
  const whatIsRef = useRef(null);
  const glyphs = [
    { name: "2", src: "/images/optimized/letter-2.webp", className: "logo-number" },
    { name: "1", src: "/images/optimized/letter-1.webp", className: "logo-number" },
    { name: "H", src: "/images/optimized/letter-H.webp", className: "logo-word" },
    { name: "O", src: "/images/optimized/letter-O.webp", className: "logo-word" },
    { name: "L", src: "/images/optimized/letter-L.webp", className: "logo-word" },
    { name: "D", src: "/images/optimized/letter-D.webp", className: "logo-word" },
    { name: "'", src: "/images/optimized/letter-apostrophe.webp", className: "logo-word logo-apostrophe" },
    { name: "E", src: "/images/optimized/letter-E.webp", className: "logo-word" },
    { name: "M", src: "/images/optimized/letter-M.webp", className: "logo-word" },
  ];
  const handSteps = [
    {
      number: "01",
      title: "Get Your Card",
      copy: "Every player starts with one private hole card."
    },
    {
      number: "02",
      title: "The Board Opens",
      copy: "Community cards are dealt to the table."
    },
    {
      number: "03",
      title: "Make Your Move",
      copy: "Check, Call, Raise, Fold, Double Down or Stand depending on the situation."
    },
    {
      number: "04",
      title: "Hit 21",
      copy: "Build the strongest total closest to 21 without busting."
    }
  ];
  const messageSteps = [
    {
      title: "What is 21 Hold'em?",
      message: "21 Hold'em is blackjack pressure on a Hold'em-style table.",
      visual: "logo"
    },
    {
      title: "One Private Card",
      message: "You get one private hole card before the board opens.",
      visual: "hole"
    },
    {
      title: "Community Cards",
      message: "Shared cards hit the table and change every player's total.",
      visual: "community"
    },
    {
      title: "Make Your Move",
      message: "Bet, check, raise, double down or stand as the hand develops.",
      visual: "moves"
    },
    {
      title: "Get 21. Win.",
      message: "Get closer to 21 than everyone else without going bust.",
      visual: "win"
    }
  ];
  const infoCards = [
    {
      kicker: "How a hand works",
      title: "How To Play",
      items: handSteps.map((step) => `${step.title}: ${step.copy}`),
      shade: "gold"
    },
    {
      kicker: "Free to play",
      title: "Your Seat Is Waiting",
      copy: ["Create your account and start playing 21 Hold'em for free."],
      items: ["Free To Play", "10,000 Chips On Signup", "Multiplayer"],
      shade: "gold"
    }
  ];
  const LogoMark = ({ className = "" }) => (
    <span className={`miniLogo ${className}`} aria-label="21 Hold'em">
      <span>21 Hold'em</span>
    </span>
  );
  const tabPanels = {
    shop: {
      title: "Shop",
      kicker: "Chip shop",
      copy: "Top up chips and manage table-ready offers from the same account wallet.",
      cards: [
        ["Starter Stack", "5,000 chips"],
        ["Value Packs", "Bigger bundles for longer sessions"],
        ["Receipts", "Purchase history ready for account sync"],
        ["Coming Next", "Featured offers and limited drops"]
      ]
    }
  };
  const rewardPrizes = [
    { label: "10,000 chips", segmentLabel: "10K", className: "rewardPrize-chips rewardPrize-jackpot", color: "gold" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "blue" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "green" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "red" },
    { label: "2,500 chips", segmentLabel: "2.5K", className: "rewardPrize-chips rewardPrize-mid", color: "purple" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "cyan" },
    { label: "x2 chips for 1 hour", segmentLabel: "x2 chips", className: "rewardPrize-multiplier", color: "violet" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "orange" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "blue" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "green" },
    { label: "5,000 chips", segmentLabel: "5K", className: "rewardPrize-chips rewardPrize-high", color: "gold" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "red" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "purple" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "cyan" },
    { label: "x2 wins for 1 hour", segmentLabel: "x2 wins", className: "rewardPrize-multiplier", color: "magenta" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "orange" },
    { label: "2,500 chips", segmentLabel: "2.5K", className: "rewardPrize-chips rewardPrize-mid", color: "gold" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "blue" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "green" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "red" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "purple" },
    { label: "5,000 chips", segmentLabel: "5K", className: "rewardPrize-chips rewardPrize-high", color: "gold" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "cyan" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "orange" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "blue" },
    { label: "2,500 chips", segmentLabel: "2.5K", className: "rewardPrize-chips rewardPrize-mid", color: "purple" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "green" },
    { label: "x2 chips for 1 hour", segmentLabel: "x2 chips", className: "rewardPrize-multiplier", color: "violet" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "red" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "cyan" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "orange" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "blue" },
    { label: "2,500 chips", segmentLabel: "2.5K", className: "rewardPrize-chips rewardPrize-mid", color: "gold" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "green" },
    { label: "x2 wins for 1 hour", segmentLabel: "x2 wins", className: "rewardPrize-multiplier", color: "magenta" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "red" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "purple" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "cyan" },
    { label: "500 chips", segmentLabel: "500", className: "rewardPrize-chips", color: "orange" },
    { label: "1,000 chips", segmentLabel: "1K", className: "rewardPrize-chips rewardPrize-low", color: "blue" },
    { label: "100 chips", segmentLabel: "100", className: "rewardPrize-chips", color: "green" },
    { label: "200 chips", segmentLabel: "200", className: "rewardPrize-chips", color: "red" }
  ];
  const getRewardSpinStorageKey = (profileId) => `21holdem.rewardSpinDate.${profileId || "guest"}`;
  const getRewardSpinDateKey = () => {
    const now = new Date();
    return [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")
    ].join("-");
  };

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const savedTheme = window.localStorage.getItem("theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    }

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!isProfileChecked) {
      return;
    }

    setHasSpunToday(
      window.localStorage.getItem(getRewardSpinStorageKey(profile?.id)) === getRewardSpinDateKey()
    );
  }, [isProfileChecked, profile]);

  useEffect(() => {
    let isMounted = true;
    const token = getCookie("sAuthToken");

    if (!token) {
      setProfile(null);
      setIsProfileChecked(true);
      return () => {
        isMounted = false;
      };
    }

    fetchProfile()
      .then((nextProfile) => {
        if (isMounted) {
          setProfile(nextProfile);
          setIsProfileChecked(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setProfile(null);
          setIsProfileChecked(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const currentWhatIs = whatIsRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setWhatIsVisible(true);
        }
      },
      { rootMargin: "-18% 0px -16% 0px", threshold: 0.22 }
    );

    if (currentWhatIs) {
      observer.observe(currentWhatIs);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleCards((current) => {
              const index = Number(entry.target.dataset.infoIndex);
              return current.includes(index) ? current : [...current, index];
            });
          }
        });
      },
      { rootMargin: "-12% 0px -18% 0px", threshold: 0.18 }
    );

    cardRefs.current.forEach((card) => {
      if (card) {
        observer.observe(card);
      }
    });

    return () => observer.disconnect();
  }, []);

  const playDing = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) {
      return;
    }

    const audio = new AudioContext();
    const now = audio.currentTime;
    const gain = audio.createGain();
    const firstTone = audio.createOscillator();
    const secondTone = audio.createOscillator();

    firstTone.type = "sine";
    firstTone.frequency.setValueAtTime(1046.5, now);
    secondTone.type = "sine";
    secondTone.frequency.setValueAtTime(1568, now + 0.08);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.48);

    firstTone.connect(gain);
    secondTone.connect(gain);
    gain.connect(audio.destination);

    firstTone.start(now);
    firstTone.stop(now + 0.34);
    secondTone.start(now + 0.08);
    secondTone.stop(now + 0.48);
  };

  const handleMoreMessages = () => {
    playDing();
    setMessageStep((current) => Math.min(current + 1, messageSteps.length - 1));
  };

  const handleReplayMessages = () => {
    playDing();
    setMessageStep(0);
  };

  const handleRewardOpen = () => {
    if (!profile || isRewardSpinning || hasSpunToday) return;

    const prizeIndex = Math.floor(Math.random() * rewardPrizes.length);

    setRewardPrize(null);
    setIsRewardSpinning(true);
    setHasSpunToday(true);
    window.localStorage.setItem(getRewardSpinStorageKey(profile.id), getRewardSpinDateKey());
    window.setTimeout(() => {
      setRewardPrize(rewardPrizes[prizeIndex]);
      setIsRewardSpinning(false);
    }, 1250);
  };

  const activeMessage = messageSteps[messageStep];
  const hasMoreMessages = messageStep < messageSteps.length - 1;
  const isSignedIn = !!profile;

  const LoginRequiredPanel = ({ label }) => (
    <div className="lockedPanel" role="status">
      <div>
        <span className="sectionKicker">Account Required</span>
        <h3>{label}</h3>
        <p>Sign in to use this section with your BSG profile and bankroll.</p>
      </div>
      <div className="lockedPanelActions">
        <a className="lockedPanelButton" href="/login">Login</a>
        <a className="lockedPanelLink" href="/signup">Sign Up</a>
      </div>
    </div>
  );

  const BrandLogoVisual = () => (
    <div className="visualLogoMark" aria-hidden="true">
      <img className="visualCrown" src="/images/optimized/crown.webp" alt="" />
      <div className="visualLetterLogo">
        {glyphs.map((glyph, index) => (
          <img
            className={`visualLogoLetter ${glyph.className}`}
            style={{ "--i": index }}
            src={glyph.src}
            alt=""
            key={`${glyph.name}-${index}`}
          />
        ))}
      </div>
    </div>
  );

  const PlayingCard = ({ value, suit, red = false, className = "" }) => (
    <div className={`explainerPlayingCard ${red ? "explainerPlayingCard-red" : ""} ${className}`} aria-hidden="true">
      <span>{suit}</span>
      <strong>{value}</strong>
    </div>
  );

  const CommunityCardsVisual = () => (
    <div className="visualCards visualCards-community" aria-hidden="true">
      <div className="communityHoleCard cardWithTotal">
        <PlayingCard value="K" suit="♥" red className="holeCard" />
        <div className="cardTotalBadge animatedTotalBadge">
          <span>10</span>
          <span>19</span>
          <span className="finalTotal">21</span>
        </div>
      </div>
      <div className="communityCardRow communityCardRow-two">
        <PlayingCard value="9" suit="♣" />
        <PlayingCard value="2" suit="♠" />
      </div>
    </div>
  );

  const CrownTwentyOneVisual = () => (
    <div className="winVisual winVisual-crowned21" aria-hidden="true">
      <img src="/images/optimized/crown.webp" alt="" />
      <strong>21</strong>
      <span>Hold'em</span>
    </div>
  );

  const TableTutorialVisual = ({ src, mode }) => (
    <div className={`gameTutorialVisual gameTutorialVisual-${mode}`} aria-hidden="true">
      <div className="gameShotFrame">
        <img src={src} alt="" />
        <span className="gameTableShade gameTableShade-top" />
        <span className="gameTableShade gameTableShade-bottom" />
        <span className="gameFocus gameFocus-hole" />
        <span className="gameFocus gameFocus-board" />
        <span className="gameFocus gameFocus-actions" />
      </div>
    </div>
  );

  const StepVisual = () => {
    if (activeMessage.visual === "logo") {
      return <BrandLogoVisual />;
    }

    if (activeMessage.visual === "hole") {
      return <TableTutorialVisual src="/images/optimized/table-hole.webp" mode="hole" />;
    }

    if (activeMessage.visual === "community") {
      return <CommunityCardsVisual />;
    }

    if (activeMessage.visual === "moves") {
      return <TableTutorialVisual src="/images/optimized/table-action.webp" mode="actions" />;
    }

    return <CrownTwentyOneVisual />;
  };

  return (
    <main className="chipPage" data-theme={theme} aria-labelledby="site-title">
      <div className="topBar">
        <div className="topBarInner">
          <div className="topBarBrand">
            <img className="topBarChip" src="/images/optimized/chip.webp" alt="" />
          </div>
          <nav className="topBarNav" aria-label="Account">
            {isProfileChecked && !isSignedIn ? (
              <>
                <a className="topBarLink" href="/login">Login</a>
                <a className="topBarSignup" href="/signup">Sign Up</a>
              </>
            ) : null}
            <HeaderProfile />
          </nav>
        </div>
      </div>

      <section className="brandReveal" aria-label="21 Hold'em brand reveal animation">
        <div className="introCharacter" aria-hidden="true" />

        <h1 id="site-title" className="logoReveal" aria-label="21 Hold'em">
          <img className="crownAsset" src="/images/optimized/crown.webp" alt="" aria-hidden="true" />
          <span className="letterLogo" aria-hidden="true">
            <span className="numberGroup">
              {glyphs.slice(0, 2).map((glyph, index) => (
                <span className={`logoLetter ${glyph.className}`} style={{ "--i": index }} key={glyph.name}>
                  <img src={glyph.src} alt="" />
                </span>
              ))}
            </span>
            <span className="logoChipSpace">
              <span className="miniChip" />
            </span>
            <span className="wordGroup">
              {glyphs.slice(2).map((glyph, index) => (
                <span className={`logoLetter ${glyph.className}`} style={{ "--i": index + 3 }} key={`${glyph.name}-${index}`}>
                  <img src={glyph.src} alt="" />
                </span>
              ))}
            </span>
          </span>
        </h1>

      </section>

      <section className="landingContent" aria-label="21 Hold'em game overview">
        <div className="contentBand introBand">
          <nav className="contentMenuBar" aria-label="21 Hold'em menu">
            <button
              id="play-now-tab"
              className={`menuSlot menuSlotPlay ${activeMenuSlot === "play-now" ? "isActive" : ""}`}
              type="button"
              aria-pressed={activeMenuSlot === "play-now"}
              aria-controls="play-now-panel"
              onClick={() => setActiveMenuSlot("play-now")}
            >
              Play Now
            </button>
            <button
              id="how-to-play-tab"
              className={`menuSlot ${activeMenuSlot === "how-to-play" ? "isActive" : ""}`}
              type="button"
              aria-pressed={activeMenuSlot === "how-to-play"}
              aria-controls="how-to-play-panel"
              onClick={() => setActiveMenuSlot("how-to-play")}
            >
              How To Play
            </button>
            <button
              id="shop-tab"
              className={`menuSlot ${activeMenuSlot === "shop" ? "isActive" : ""}`}
              type="button"
              aria-pressed={activeMenuSlot === "shop"}
              aria-controls="shop-panel"
              onClick={() => setActiveMenuSlot("shop")}
            >
              Shop
            </button>
            <button
              id="rewards-tab"
              className={`menuSlot ${activeMenuSlot === "rewards" ? "isActive" : ""}`}
              type="button"
              aria-pressed={activeMenuSlot === "rewards"}
              aria-controls="rewards-panel"
              onClick={() => setActiveMenuSlot("rewards")}
            >
              Rewards
            </button>
          </nav>
        </div>

        <div className="menuContentWindow" id="rules">
        <section
          className="menuLobbyPanel"
          id="play-now-panel"
          role="tabpanel"
          aria-labelledby="play-now-tab"
          hidden={activeMenuSlot !== "play-now"}
        >
          {isProfileChecked && isSignedIn ? <LobbyPanel embedded /> : <LoginRequiredPanel label="Play Now is locked" />}
        </section>
        <section
          className={`messageIntroSection ${whatIsVisible ? "isVisible" : ""}`}
          id="how-to-play-panel"
          role="tabpanel"
          ref={whatIsRef}
          aria-labelledby="how-to-play-tab"
          hidden={activeMenuSlot !== "how-to-play"}
        >
          <div className="phoneShowcase">
            <div className="angledPhone">
              <div className="phoneSpeaker" />
              <div className="phoneScreen">
                <div className="phoneStatus">
                  <span>21H</span>
                  <button className="phoneReplayButton" type="button" onClick={handleReplayMessages} aria-label="Replay explainer">
                    ↻
                  </button>
                  <span>9:21</span>
                </div>
                <div className="phoneNotification">
                  <img className="notificationIcon" src="/images/optimized/chip.webp" alt="" />
                  <div>
                    <p>What is 21 Hold'em?</p>
                  </div>
                </div>
                <div className="phoneStepVisualPanel" key={`phone-${activeMessage.visual}`}>
                  <StepVisual />
                </div>
                <div className="phoneMessageStack desktopPhoneMessages">
                  <article className="phoneMessageBubble" style={{ "--bubble-delay": "0ms" }} key={`desktop-${activeMessage.title}`}>
                    <p>{activeMessage.message}</p>
                  </article>
                  <button
                    className={`phoneMoreButton phoneReadMoreButton ${hasMoreMessages ? "" : "isHidden"}`}
                    type="button"
                    onClick={handleMoreMessages}
                    disabled={!hasMoreMessages}
                  >
                    Read More
                  </button>
                </div>
                <div className="phoneMessageStack mobilePhoneMessages" key={`message-${activeMessage.title}`}>
                  <article className="phoneMessageBubble" style={{ "--bubble-delay": "0ms" }}>
                    <p>{activeMessage.message}</p>
                  </article>
                  <button
                    className={`phoneMoreButton phoneReadMoreButton ${hasMoreMessages ? "" : "isHidden"}`}
                    type="button"
                    onClick={handleMoreMessages}
                    disabled={!hasMoreMessages}
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="messageExplainer">
            <p className="sectionKicker">21 Hold'em explained</p>
            <h2 id="what-is-title">{activeMessage.title}</h2>
            <div className={`messageVisualPanel visual-${activeMessage.visual}`} key={activeMessage.visual}>
              <StepVisual />
            </div>
          </div>
        </section>
        {["shop"].map((slot) => (
          <section
            className={`appFeaturePanel appFeaturePanel-${slot}`}
            id={`${slot}-panel`}
            role="tabpanel"
            aria-labelledby={`${slot}-tab`}
            hidden={activeMenuSlot !== slot}
            key={slot}
          >
            <div className="appFeatureCopy">
              <p className="sectionKicker">{tabPanels[slot].kicker}</p>
              <h2>{tabPanels[slot].title}</h2>
              <p>{tabPanels[slot].copy}</p>
            </div>
            <div className="appFeatureGrid">
              {tabPanels[slot].cards.map(([title, copy], index) => (
                <article className="appFeatureCard" style={{ "--card-delay": `${index * 70}ms` }} key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>
          </section>
        ))}
        <section
          className="rewardPanel"
          id="rewards-panel"
          role="tabpanel"
          aria-labelledby="rewards-tab"
          hidden={activeMenuSlot !== "rewards"}
        >
          {isProfileChecked && isSignedIn ? (
          <div className="rewardChipLayout">
            <div className={`rewardChipStage ${isRewardSpinning ? "isSpinning" : ""} ${rewardPrize ? "hasPrize" : ""}`}>
              <button
                className={`rewardChipButton ${hasSpunToday && !isRewardSpinning ? "isLocked" : ""}`}
                type="button"
                onClick={handleRewardOpen}
                disabled={isRewardSpinning || hasSpunToday}
                aria-label={hasSpunToday ? "Daily reward already claimed" : "Turn chip for daily reward"}
              >
                <img src="/images/optimized/chip.webp" alt="" />
                <span>{isRewardSpinning ? "Turning" : hasSpunToday ? "Claimed" : "Turn Chip"}</span>
              </button>
              <span className="rewardFlash" aria-hidden="true" />
              {rewardPrize ? (
                <strong className={`rewardPrize ${rewardPrize.className}`}>{rewardPrize.label}</strong>
              ) : null}
            </div>
            <div className="availablePrizePanel" aria-label="Available daily reward prizes">
              <p className="sectionKicker">Available Prizes</p>
              <div className="availablePrizeGrid">
                {[...new Map(rewardPrizes.map((prize) => [prize.label, prize])).values()].map((prize) => (
                  <span className={`availablePrize availablePrize-${prize.color}`} key={prize.label}>
                    {prize.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
          ) : (
            <LoginRequiredPanel label="Daily Rewards are locked" />
          )}
        </section>
        {activeMenuSlot === "how-to-play" ? (
          <a className="windowMoreCue" href="#info">How To Play <span aria-hidden="true">⌄</span></a>
        ) : null}
        </div>

        <section
          className="infoCardSection"
          id="info"
          aria-label="21 Hold'em information"
          hidden={activeMenuSlot !== "how-to-play"}
        >
          {infoCards.map((card, index) => (
            <article
              className={`infoCard infoCard-${card.shade} ${visibleCards.includes(index) ? "isVisible" : ""}`}
              data-info-index={index}
              key={card.title}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
            >
              <div className="infoCardHeader">
                <p className="sectionKicker">{card.kicker}</p>
                <h2>{card.title}</h2>
              </div>
              <div className="infoCardBody">
                {card.copy?.map((copy) => (
                  <p className={copy.startsWith("Bet.") ? "moveLine" : ""} key={copy}>{copy}</p>
                ))}
                {card.items ? (
                  <div className="infoColumnGrid">
                    {card.items.map((item) => (
                      <span key={item}>{item}</span>
                    ))}
                  </div>
                ) : null}
                {index === infoCards.length - 1 ? (
                  <div className="actionRow">
                    <a className="primaryAction largeAction" href="/lobby">Play Now</a>
                    <a className="secondaryAction" href="/signup">Create Account</a>
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </section>

        <section className="finalCtaSection" id="play" aria-labelledby="final-title">
          <LogoMark className="finalLogo" />
          <h2 id="final-title">Think You Know 21?</h2>
          <p>There's only one way to find out.</p>
          <a className="primaryAction largeAction" href="/lobby">Take A Seat</a>
        </section>

        <footer className="siteFooter">
          <LogoMark />
          <nav aria-label="Footer">
            <a href="/lobby">Play</a>
            <a href="#rules">Rules</a>
            <a href="/login">Login</a>
            <a href="/signup">Sign Up</a>
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </nav>
          <p>Big Slick Games. Copyright {currentYear}.</p>
        </footer>
      </section>
    </main>
  );
}

