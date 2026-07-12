import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';
import Phaser from "phaser";
import Preload from "../../scenes/Preload";
import Level from "../../scenes/Level";
import config from "../../scripts/config";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import game_bg from '../../assets/images/bg/game_bg.png';
import loadingSplash from '../../assets/images/splash/21holdem-sidebets-loading.png';
import cardBackImage from '../../assets/images/card/card_back.png';
import cardFrontImage from '../../assets/images/card/card_front.png';
import clubImage from '../../assets/images/card/club.png';
import diamondImage from '../../assets/images/card/diamond.png';
import heartImage from '../../assets/images/card/heart.png';
import spadeImage from '../../assets/images/card/spades.png';
import nathanReedSpriteSheet from '../../assets/images/player-profile/sprites/nathan-reed-actions-sprite-sheet-4x5.png';
import nathanReedSpriteMeta from '../../assets/images/player-profile/sprites/nathan-reed-actions-sprite-sheet.json';
import GameActionOverlay from "./GameActionOverlay";
import { hideGameActionOverlay } from "../../scripts/gameActionOverlayBridge";
import { getAvatarImageSrc } from "../../shared/constants/builtInAvatars";
import gameElementControls from "./gameElementControls.json";
import profileLayoutControls from "./profileLayoutControls.json";
import { getProfile } from "../../query/profile.query";
import { getCookie } from "../../shared/utils";

const TABLE_EDGE_SEATS = [4, 5, 3, 6, 2, 7, 1, 8];
const DEFAULT_SEAT_POSITIONS = {
    1: { xPercent: 18, yPercent: 90 },
    2: { xPercent: 21, yPercent: 64 },
    3: { xPercent: 33, yPercent: 36 },
    4: { xPercent: 42, yPercent: 10 },
    5: { xPercent: 58, yPercent: 10 },
    6: { xPercent: 67, yPercent: 36 },
    7: { xPercent: 79, yPercent: 64 },
    8: { xPercent: 82, yPercent: 90 },
};

function clampNumber(value, fallback, min = -Infinity, max = Infinity) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return fallback;
    return Math.min(Math.max(numericValue, min), max);
}

function buildSeatAnchorStyle(nSeat) {
    const seatControl = profileLayoutControls.seats?.[String(nSeat)] || {};
    const fallback = DEFAULT_SEAT_POSITIONS[nSeat] || { xPercent: 50, yPercent: 50 };
    return {
        '--profile-x': `${clampNumber(seatControl.xPercent, fallback.xPercent, 0, 100)}%`,
        '--profile-y': `${clampNumber(seatControl.yPercent, fallback.yPercent, 0, 100)}%`,
        '--profile-nudge-x': `${clampNumber(seatControl.moveRightPx, 0)}px`,
        '--profile-nudge-y': `${clampNumber(seatControl.moveDownPx, 0)}px`,
    };
}

function buildGameElementStyle() {
    const profile = gameElementControls.playerProfile || {};
    const consoleControls = gameElementControls.bottomConsole || {};
    return {
        '--seat-avatar-size': `${clampNumber(profile.avatarSizePx, 60, 24, 120)}px`,
        '--seat-action-label-top': `${clampNumber(profile.actionLabelTopPx, -30, -120, 120)}px`,
        '--seat-action-label-height': `${clampNumber(profile.actionLabelHeightPx, 24, 14, 60)}px`,
        '--seat-card-back-width': `${clampNumber(profile.cardBackWidthPx, 26, 0, 90)}px`,
        '--seat-card-back-height': `${clampNumber(profile.cardBackHeightPx, 37, 0, 130)}px`,
        '--seat-card-back-right': `${clampNumber(profile.cardBackRightPx, 12, -120, 120)}px`,
        '--seat-card-back-top': `${clampNumber(profile.cardBackTopPx, 26, -120, 120)}px`,
        '--seat-name-font-size': `${clampNumber(profile.nameFontPx, 10, 6, 24)}px`,
        '--seat-chip-font-size': `${clampNumber(profile.chipFontPx, 10, 6, 24)}px`,
        '--seat-score-top': `${clampNumber(profile.scoreTopPx, -22, -120, 120)}px`,
        '--seat-blind-left': `calc(50% + ${clampNumber(profile.blindLeftPx, -42, -160, 160)}px)`,
        '--seat-blind-top': `${clampNumber(profile.blindTopPx, -9, -120, 120)}px`,
        '--game-mobile-console-height-control': `${clampNumber(consoleControls.mobileHeightPx, 90, 50, 180)}px`,
        '--game-hole-card-height-offset': `${clampNumber(consoleControls.holeCardHeightOffsetPx, 14, 0, 80)}px`,
        '--game-hole-card-gap': `${clampNumber(consoleControls.holeCardGapPx, 5, 0, 30)}px`,
        '--game-hole-card-move-up': `${clampNumber(consoleControls.holeCardMoveUpPx, 10, -80, 80)}px`,
        '--game-folded-hole-card-opacity': clampNumber(consoleControls.foldedHoleCardOpacity, 0.2, 0, 1),
    };
}

function formatSlotChips(value) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return '--';
    return numericValue >= 1000 ? `${Math.round(numericValue / 100) / 10}K` : String(numericValue);
}

function getShowdownCardLabel(card) {
    const nLabel = Number(card?.nLabel);
    if (nLabel === 1) return 'A';
    if (nLabel === 11) return 'J';
    if (nLabel === 12) return 'Q';
    if (nLabel === 13) return 'K';
    return String(card?.nLabel || '');
}

function getShowdownCardSuit(card) {
    const sSuitKey = String(card?.eSuit || '').toLowerCase()[0];
    return {
        c: { image: clubImage, name: 'club', red: false },
        d: { image: diamondImage, name: 'diamond', red: true },
        h: { image: heartImage, name: 'heart', red: true },
        s: { image: spadeImage, name: 'spade', red: false },
    }[sSuitKey] || { image: spadeImage, name: 'spade', red: false };
}

function getNathanReedActionKey(player, sActionLabel, bShowdownWinner, bShowdownEligible, isInactiveHand) {
    const sUserName = String(player?.sUserName || '').replace(/[^a-z0-9]/gi, '').toLowerCase();
    if (sUserName !== 'nathanreed') return '';

    const sLabel = String(sActionLabel || '').toLowerCase();
    if (sLabel.includes('check')) return 'check';
    if (sLabel.includes('raise') || sLabel.includes('bet')) return 'raise';
    if (sLabel.includes('call')) return 'call';
    if (sLabel.includes('bust')) return 'lose';
    if (bShowdownWinner) return 'win';
    if (bShowdownEligible && !bShowdownWinner) return 'lose';
    if (isInactiveHand) return 'lose';

    return '';
}

function PlayerRailSlot({ nSeat, player, style }) {
    if (!player) return null;

    const avatarSrc = player ? getAvatarImageSrc(player.sAvatar, player.sUserName || 'Player', player.nSeat) : '';
    const initials = String(player?.sUserName || 'Seat').slice(0, 2).toUpperCase();
    const sPlayerState = String(player?.eState || '').toLowerCase();
    const isFolded = sPlayerState === 'fold';
    const isBusted = sPlayerState === 'bust';
    const isInactiveHand = isFolded || isBusted;
    const nTurnMs = Math.max(500, Number(player?.nTurnTimerMs) || 12000);
    const nScore = Number(player?.nCardScore);
    const bShowScore = Boolean(player?.bShowScore);
    const sBlindRole = String(player?.sBlindRole || '').trim();
    const sActionLabel = !player?.bLocalPlayer ? String(player?.sActionLabel || '').trim() : '';
    const bShowdownEligible = bShowScore && !isInactiveHand;
    const aShowdownCards = bShowdownEligible && Array.isArray(player?.aCardHand) ? player.aCardHand.slice(0, 2) : [];
    const bShowdownWinner = Boolean(player?.bShowdownWinner);
    const nShowdownWinAmount = Math.max(0, Number(player?.nShowdownWinAmount) || 0);
    const sNathanActionKey = getNathanReedActionKey(player, sActionLabel, bShowdownWinner, bShowdownEligible, isInactiveHand);
    const oNathanAnimation = sNathanActionKey ? nathanReedSpriteMeta.animations?.[sNathanActionKey] : null;
    const sSpriteRestartKey = `${player.iUserId || nSeat}-${sNathanActionKey}-${player.nActionLabelKey || bShowScore || sPlayerState}`;

    return (
        <span
            className={`game-table-page__seat-slot game-table-page__seat-slot--seat-${nSeat} is-occupied${isFolded ? ' is-folded' : ''}${isBusted ? ' is-busted' : ''}${isInactiveHand ? ' is-inactive-hand' : ''}${player?.bActiveTurn ? ' is-active-turn' : ''}`}
            style={{
                ...style,
                '--seat-turn-ms': `${nTurnMs}ms`,
            }}
            data-player-seat={nSeat}
            data-player-user-id={player.iUserId || ''}
        >
            <span className={`game-table-page__seat-avatar${aShowdownCards.length ? ' has-showdown-cards' : ''}`}>
                {avatarSrc ? <img className='game-table-page__seat-avatar-image' src={avatarSrc} alt='' draggable='false' /> : <span className='game-table-page__seat-initials'>{initials}</span>}
                {oNathanAnimation ? (
                    <span
                        className={`game-table-page__seat-avatar-sprite game-table-page__seat-avatar-sprite--${sNathanActionKey}`}
                        key={sSpriteRestartKey}
                        style={{
                            '--seat-avatar-sprite': `url("${nathanReedSpriteSheet}")`,
                            '--seat-avatar-sprite-duration': `${Math.max(80, Number(oNathanAnimation.frameDurationMs) || 120) * 4}ms`,
                        }}
                    />
                ) : null}
                {bShowScore && Number.isFinite(nScore) && nScore > 0 ? (
                    <span className='game-table-page__seat-score'>{nScore}</span>
                ) : null}
            </span>
            {aShowdownCards.length ? (
                <span className='game-table-page__seat-showdown-cards'>
                    {aShowdownCards.map((card, index) => {
                        const suit = getShowdownCardSuit(card);
                        const label = getShowdownCardLabel(card);
                        const key = card?._id || `${card?.eSuit || 'card'}-${card?.nLabel || index}-${index}`;
                        return (
                            <span className={`game-table-page__seat-showdown-card${suit.red ? ' is-red' : ''}`} key={key}>
                                <img className='game-table-page__seat-showdown-card-face' src={cardFrontImage} alt='' draggable='false' />
                                <img className='game-table-page__seat-showdown-card-suit' src={suit.image} alt={suit.name} draggable='false' />
                                <strong>{label}</strong>
                            </span>
                        );
                    })}
                </span>
            ) : null}
            {sBlindRole ? <span className='game-table-page__seat-blind'>{sBlindRole}</span> : null}
            {bShowdownWinner ? (
                <span className='game-table-page__seat-win' aria-label='Winner'>
                    <span className='game-table-page__seat-win-crown'>{'\u265B'}</span>
                    <strong>{nShowdownWinAmount > 0 ? `+${formatSlotChips(nShowdownWinAmount)}` : 'Winner'}</strong>
                </span>
            ) : null}
            {sActionLabel ? (
                <span className='game-table-page__seat-action-label' key={`${player.iUserId || nSeat}-${player.nActionLabelKey || sActionLabel}`}>
                    {sActionLabel}
                </span>
            ) : null}
            <span className='game-table-page__seat-copy'>
                <strong>{player.sUserName || 'Player'}</strong>
                <em>{formatSlotChips(player.nChips)}</em>
            </span>
            {!isFolded && !aShowdownCards.length ? (
                <img className='game-table-page__seat-card-back' src={cardBackImage} alt='' draggable='false' />
            ) : null}
        </span>
    );
}

class Boot extends Phaser.Scene {
    constructor() {
        super({ key: 'Boot' });
    }
    init(data) {
        this.sAuthToken = data.sAuthToken;
        this.iBoardId = data.iBoardId;
        this.sPrivateCode = data.sPrivateCode;
        this.isGuestTutorial = Boolean(data.isGuestTutorial);
        this.fallbackPath = data.fallbackPath;
        this.tableOnlyMode = Boolean(data.tableOnlyMode);
    }
    preload() {
        const data = {
            sAuthToken: this.sAuthToken,
            iBoardId: this.iBoardId,
            sPrivateCode: this.sPrivateCode,
            isGuestTutorial: this.isGuestTutorial,
            fallbackPath: this.fallbackPath,
            tableOnlyMode: this.tableOnlyMode,
        }
        let bPreloadStarted = false;
        const startPreload = () => {
            if (bPreloadStarted) return;
            bPreloadStarted = true;
            this.scene.start("Preload", data);
        };
        this.load.on(Phaser.Loader.Events.LOAD_ERROR, (file) => {
            console.error('Boot asset failed:', file?.key || '', file?.src || file?.url || '');
        });
        this.load.on(Phaser.Loader.Events.COMPLETE, () => startPreload());
        this.load.image('game_bg', game_bg);
        this.load.image('preload_splash', loadingSplash);
        this.time.delayedCall(8000, () => startPreload());
    }
}
function Game({ isPausedExternally = false }) {
    const { sAuthToken, iBoardId, sPrivateCode, fallbackPath = '/lobby', isGuestTutorial = false } = useLocation()?.state || {};
    const navigate = useNavigate();
    const cookieAuthToken = getCookie('sAuthToken');
    const resolvedAuthToken = sAuthToken || cookieAuthToken;
    const {
        data: profileResp,
        isLoading: isProfileLoading,
        isFetching: isProfileFetching,
        isFetched: isProfileFetched,
    } = useQuery('game-profile-board', getProfile, {
        enabled: Boolean(resolvedAuthToken) && !iBoardId,
        staleTime: 5000,
    });
    const activeProfileBoardId = profileResp?.data?.data?.aPokerBoard?.[0];
    const resolvedBoardId = iBoardId || activeProfileBoardId;
    const gameRef = useRef(null);
    const phaserGameRef = useRef(null);
    const [playerSlots, setPlayerSlots] = useState([]);
    const layoutMode = 'mobile';
    const tableOnlyMode = false;
    const profileSeatStyles = useMemo(() => TABLE_EDGE_SEATS.reduce((nextStyles, nSeat) => {
        nextStyles[nSeat] = buildSeatAnchorStyle(nSeat);
        return nextStyles;
    }, {}), []);
    const gameElementStyle = useMemo(() => buildGameElementStyle(), []);
    const playersBySeat = useMemo(() => playerSlots.reduce((nextPlayersBySeat, player) => {
        const nSeat = Number(player?.nSeat);
        if (Number.isFinite(nSeat)) nextPlayersBySeat[nSeat] = player;
        return nextPlayersBySeat;
    }, {}), [playerSlots]);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

        const setVisibleViewportHeight = () => {
            const viewportHeight = window.visualViewport?.height || window.innerHeight;
            document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
        };

        setVisibleViewportHeight();
        window.addEventListener('resize', setVisibleViewportHeight);
        window.addEventListener('orientationchange', setVisibleViewportHeight);
        window.visualViewport?.addEventListener('resize', setVisibleViewportHeight);
        window.visualViewport?.addEventListener('scroll', setVisibleViewportHeight);

        return () => {
            window.removeEventListener('resize', setVisibleViewportHeight);
            window.removeEventListener('orientationchange', setVisibleViewportHeight);
            window.visualViewport?.removeEventListener('resize', setVisibleViewportHeight);
            window.visualViewport?.removeEventListener('scroll', setVisibleViewportHeight);
        };
    }, []);

    useEffect(() => {
        if (typeof document === 'undefined') return;

        window.FXOverlayUI?.closeBugPanel?.();
        document.querySelector('#fx-overlay-ui-root .fxui-bug-panel')?.remove();
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        const handlePlayerSlots = (event) => {
            setPlayerSlots(Array.isArray(event?.detail?.players) ? event.detail.players : []);
        };

        window.addEventListener('bsg:game-player-slots', handlePlayerSlots);
        return () => window.removeEventListener('bsg:game-player-slots', handlePlayerSlots);
    }, []);

    useEffect(() => {
        if (!resolvedAuthToken) {
            navigate(fallbackPath);
            return;
        }

        if (!resolvedBoardId) {
            if (!isProfileLoading && !isProfileFetching && isProfileFetched) navigate(fallbackPath);
            return;
        }

        config.setLayout('mobile');
        const gameConfig = {
            type: Phaser.AUTO,
            width: config.width,
            height: config.height,
            version: config.version,
            title: config.title,
            parent: "game-stage",
            transparent: true,
            render: {
                preserveDrawingBuffer: true,
            },
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
            },
        };
        const game = new Phaser.Game(gameConfig);
        const data = {
            sAuthToken: resolvedAuthToken,
            iBoardId: resolvedBoardId,
            sPrivateCode: sPrivateCode,
            isGuestTutorial,
            fallbackPath,
            tableOnlyMode,
        }
        game.scene.add('Level', Level);
        game.scene.add('Preload', Preload);
        game.scene.add('Boot', Boot, true, data);
        phaserGameRef.current = game;

        return () => {
            hideGameActionOverlay();
            window.dispatchEvent(new CustomEvent('bsg:profile-refresh'));
            phaserGameRef.current = null;
            game.destroy(true);
        };

    }, [fallbackPath, isGuestTutorial, isProfileFetched, isProfileFetching, isProfileLoading, navigate, resolvedAuthToken, resolvedBoardId, sPrivateCode, tableOnlyMode]);

    useEffect(() => {
        const game = phaserGameRef.current;
        if (!game) return;

        if (game.canvas) {
            game.canvas.style.pointerEvents = isPausedExternally ? 'none' : 'auto';
        }

        if (isPausedExternally) {
            if (game.scene.isActive('Level')) game.scene.pause('Level');
            if (game.scene.isActive('Preload')) game.scene.pause('Preload');
            if (game.scene.isActive('Boot')) game.scene.pause('Boot');
            return;
        }

        if (game.scene.isPaused('Level')) game.scene.resume('Level');
        if (game.scene.isPaused('Preload')) game.scene.resume('Preload');
        if (game.scene.isPaused('Boot')) game.scene.resume('Boot');
    }, [isPausedExternally]);

    return (
        <div className={`game-table-page game-shell game-shell--${layoutMode}`} style={gameElementStyle}>
            <div className='game-table-page__overlay-layer'>
                <GameActionOverlay isPaused={isPausedExternally} />
            </div>
            <div className='game-table-page__row game-table-page__row--top' aria-hidden='true'>
                <div className='game-table-page__col game-table-page__col--left' />
                <div className='game-table-page__col game-table-page__col--center' />
                <div className='game-table-page__col game-table-page__col--right' />
            </div>
            <div className='game-table-page__row game-table-page__row--middle'>
                <div className='game-table-page__seat-overlay' aria-hidden='true'>
                    {TABLE_EDGE_SEATS.map((nSeat) => (
                        <PlayerRailSlot nSeat={nSeat} player={playersBySeat[nSeat]} style={profileSeatStyles[nSeat]} key={`table-edge-seat-${nSeat}`} />
                    ))}
                </div>
                <main className='game-table-page__col game-table-page__col--table' aria-label='21 Holdem table'>
                    <div
                        id='game-stage'
                        className={`game-stage game-stage--${layoutMode}${tableOnlyMode ? ' game-stage--table-only' : ''}`}
                        ref={gameRef}
                    />
                </main>
            </div>
            <div className='game-table-page__row game-table-page__row--bottom' aria-hidden='true'>
                <div className='game-table-page__col game-table-page__col--left' />
                <div className='game-table-page__col game-table-page__col--center' />
                <div className='game-table-page__col game-table-page__col--right' />
            </div>
        </div>
    );
}

Game.propTypes = {
    isPausedExternally: PropTypes.bool,
};

Game.defaultProps = {
    isPausedExternally: false,
};

PlayerRailSlot.propTypes = {
    nSeat: PropTypes.number.isRequired,
    player: PropTypes.shape({
        nSeat: PropTypes.number,
        nTableSeat: PropTypes.number,
        sAvatar: PropTypes.string,
        sUserName: PropTypes.string,
        nChips: PropTypes.number,
        eState: PropTypes.string,
        sBlindRole: PropTypes.string,
        bShowScore: PropTypes.bool,
        nCardScore: PropTypes.number,
        aCardHand: PropTypes.arrayOf(PropTypes.object),
        sActionLabel: PropTypes.string,
        nActionLabelKey: PropTypes.number,
        bLocalPlayer: PropTypes.bool,
        bShowdownWinner: PropTypes.bool,
        nShowdownWinAmount: PropTypes.number,
    }),
    style: PropTypes.shape({}),
};

PlayerRailSlot.defaultProps = {
    player: null,
    style: undefined,
};

export default Game;
