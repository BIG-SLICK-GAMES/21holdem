import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from 'prop-types';
import Phaser from "phaser";
import Preload from "../../scenes/Preload";
import Level from "../../scenes/Level";
import config from "../../scripts/config";
import installPhaserAudioContextGuard from "../../scripts/phaserAudioContextGuard";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import loadingSplash from '../../assets/images/splash/21holdem-loading.png';
import cardBackImage from '../../assets/images/card/card_back.png';
import cardFrontImage from '../../assets/images/card/card_front.png';
import clubImage from '../../assets/images/card/club.png';
import diamondImage from '../../assets/images/card/diamond.png';
import heartImage from '../../assets/images/card/heart.png';
import spadeImage from '../../assets/images/card/spades.png';
import GameActionOverlay from "./GameActionOverlay";
import { hideGameActionOverlay } from "../../scripts/gameActionOverlayBridge";
import { getGameAvatar } from "../../shared/constants/builtInAvatars";
import gameElementControls from "./gameElementControls.json";
import profileLayoutControls from "./profileLayoutControls.json";
import { getProfile } from "../../query/profile.query";
import { getTables, joinTable } from "../../query/gameTable.query";
import { getCookie, ReactToastify } from "../../shared/utils";
import { mobileTableLayout } from '../../scripts/mobileTableLayout';
import { tableRailSeats } from '../../scripts/tableRailSeats';

installPhaserAudioContextGuard(Phaser);

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

function PlayerRailSlot({ nSeat, player, style }) {
    if (!player) return null;

    const avatarSrc = player ? getGameAvatar(player.sAvatar, player.sUserName || 'Player').sPath : '';
    const initials = String(player?.sUserName || 'Seat').slice(0, 2).toUpperCase();
    const sPlayerState = String(player?.eState || '').toLowerCase();
    const isFolded = sPlayerState === 'fold';
    const isBusted = sPlayerState === 'bust';
    const isInactiveHand = isFolded || isBusted;
    const nTurnMs = Math.max(500, Number(player?.nTurnTimerMs) || 12000);
    const nScore = Number(player?.nCardScore);
    const bShowScore = Boolean(player?.bShowScore);
    const sBlindRole = String(player?.sBlindRole || '').trim();
    const bLocalPlayer = Boolean(player?.bLocalPlayer);
    const sActionLabel = String(player?.sActionLabel || '').trim();
    const bShowdownEligible = bShowScore && !isInactiveHand;
    const aShowdownCards = bShowdownEligible && Array.isArray(player?.aCardHand) ? player.aCardHand.slice(0, 2) : [];
    const bShowdownWinner = Boolean(player?.bShowdownWinner);
    const nShowdownWinAmount = Math.max(0, Number(player?.nShowdownWinAmount) || 0);

    return (
        <span
            className={`game-table-page__seat-slot game-table-page__seat-slot--seat-${nSeat} is-occupied${bLocalPlayer ? ' is-local-player' : ''}${isFolded ? ' is-folded' : ''}${isBusted ? ' is-busted' : ''}${isInactiveHand ? ' is-inactive-hand' : ''}${player?.bActiveTurn ? ' is-active-turn' : ''}`}
            style={{
                ...style,
                '--seat-turn-ms': `${nTurnMs}ms`,
            }}
            data-player-seat={nSeat}
            data-player-user-id={player.iUserId || ''}
        >
            <span className={`game-table-page__seat-avatar${aShowdownCards.length ? ' has-showdown-cards' : ''}`}>
                {avatarSrc ? <img className='game-table-page__seat-avatar-image' src={avatarSrc} alt='' draggable='false' /> : <span className='game-table-page__seat-initials'>{initials}</span>}
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
        this.sTableTheme = data.sTableTheme || '';
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
            sTableTheme: this.sTableTheme,
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
            clearTimeout(nBootTimeout);
            this.scene.start("Preload", data);
        };
        const nBootTimeout = setTimeout(() => startPreload(), 8000);
        this.load.on(Phaser.Loader.Events.LOAD_ERROR, (file) => {
            console.error('Boot asset failed:', file?.key || '', file?.src || file?.url || '');
        });
        this.load.on(Phaser.Loader.Events.COMPLETE, () => startPreload());
        this.load.image('preload_splash', loadingSplash);
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
    } = useQuery(['game-profile-board', resolvedAuthToken], getProfile, {
        enabled: Boolean(resolvedAuthToken),
        staleTime: 5000,
    });
    const activeProfileBoardId = profileResp?.data?.data?.aPokerBoard?.[0];
    const equippedTableTheme = profileResp?.data?.data?.sTableTheme || '';
    useEffect(() => {
        const themes = ['timber-saloon-scene', 'riverboat-lounge-scene', 'art-deco-club-scene', 'neon-skyline-scene', 'grand-casino-scene'];
        const isRiverboat = equippedTableTheme === 'riverboat-lounge-scene';
        const image = isRiverboat ? 'riverboat-room-v2.webp' : themes.includes(equippedTableTheme) ? `${equippedTableTheme}.webp` : 'classic-room-v2.webp';
        document.documentElement.style.setProperty('--game-room-image', `url("/images/shop/${image}")`);
        // Room-only artwork can fill the viewport without enlarging a small crop of the shop preview.
        const usesShopPreview = themes.includes(equippedTableTheme) && !isRiverboat;
        document.documentElement.style.setProperty('--game-room-size', usesShopPreview ? 'max(100vw, 300vh) auto' : 'cover');
        document.documentElement.style.setProperty('--game-room-position', usesShopPreview ? 'center top' : 'center');
        return () => ['--game-room-image', '--game-room-size', '--game-room-position'].forEach(key => document.documentElement.style.removeProperty(key));
    }, [equippedTableTheme]);
    const [joinedBoardId, setJoinedBoardId] = useState(null);
    const [isAutoJoining, setIsAutoJoining] = useState(false);
    const resolvedBoardId = iBoardId || joinedBoardId || activeProfileBoardId;
    const gameRef = useRef(null);
    const phaserGameRef = useRef(null);
    const autoJoinAttemptedRef = useRef(false);
    const viewportRafRef = useRef(0);
    const lastViewportHeightRef = useRef(0);
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
            const viewportHeight = window.innerHeight;
            if (Math.abs(viewportHeight - lastViewportHeightRef.current) < 8) return;
            lastViewportHeightRef.current = viewportHeight;
            document.documentElement.style.setProperty('--vh', `${viewportHeight * 0.01}px`);
        };
        const queueVisibleViewportHeight = () => {
            window.cancelAnimationFrame(viewportRafRef.current);
            viewportRafRef.current = window.requestAnimationFrame(setVisibleViewportHeight);
        };

        setVisibleViewportHeight();
        window.addEventListener('resize', queueVisibleViewportHeight);
        window.addEventListener('orientationchange', queueVisibleViewportHeight);

        return () => {
            window.cancelAnimationFrame(viewportRafRef.current);
            window.removeEventListener('resize', queueVisibleViewportHeight);
            window.removeEventListener('orientationchange', queueVisibleViewportHeight);
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
        }

    }, [fallbackPath, navigate, resolvedAuthToken]);

    useEffect(() => {
        if (!resolvedAuthToken || resolvedBoardId || autoJoinAttemptedRef.current) return undefined;
        if (isProfileLoading || isProfileFetching || !isProfileFetched) return undefined;

        let bCancelled = false;
        autoJoinAttemptedRef.current = true;
        setIsAutoJoining(true);

        const joinFirstPublicTable = async () => {
            try {
                const tablesResp = await getTables('public');
                const aTables = Array.isArray(tablesResp?.data?.data) ? tablesResp.data.data : [];
                const oTable = aTables.find((table) => table?._id || table?.id);
                const iProtoId = oTable?._id || oTable?.id;

                if (!iProtoId) {
                    ReactToastify('No public 21 Holdem tables are available yet.', 'error');
                    navigate(fallbackPath);
                    return;
                }

                const joinResp = await joinTable(iProtoId);
                const iNextBoardId = joinResp?.data?.data?.iBoardId;
                if (!iNextBoardId) throw new Error(joinResp?.data?.message || 'Unable to join table');
                if (!bCancelled) setJoinedBoardId(iNextBoardId);
            } catch (error) {
                if (bCancelled) return;

                const sResponseMessage = error?.response?.data?.message || '';
                if (/maximum limit of joining boards/i.test(sResponseMessage)) {
                    try {
                        const profileResponse = await getProfile();
                        const iActiveBoardId = profileResponse?.data?.data?.aPokerBoard?.[0];
                        if (iActiveBoardId && !bCancelled) {
                            setJoinedBoardId(iActiveBoardId);
                            return;
                        }
                    } catch (profileError) {
                    }
                }

                ReactToastify(sResponseMessage || 'Unable to open a 21 Holdem table.', 'error');
                navigate(fallbackPath);
            } finally {
                if (!bCancelled) setIsAutoJoining(false);
            }
        };

        joinFirstPublicTable();

        return () => {
            bCancelled = true;
        };
    }, [fallbackPath, isProfileFetched, isProfileFetching, isProfileLoading, navigate, resolvedAuthToken, resolvedBoardId]);

    useEffect(() => {
        if (!resolvedAuthToken || !resolvedBoardId || isAutoJoining || !isProfileFetched) return undefined;

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
            sTableTheme: equippedTableTheme,
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

        let lastLayoutKey = '';
        let nextLayoutCheck = 0;
        const mobilePortrait = window.matchMedia('(max-width: 767px) and (orientation: portrait)');
        const alignTableSeats = () => {
            if (performance.now() < nextLayoutCheck) return;
            nextLayoutCheck = performance.now() + 250;
            // Desktop/landscape seats follow the rendered table, including its
            // container transform, camera, canvas fit and saved table placement.
            if (!mobilePortrait.matches) {
                if (lastLayoutKey.startsWith('mobile,')) {
                    game.scene.getScene('Level')?.applyGameUILayout();
                    lastLayoutKey = '';
                }
                const level = game.scene.getScene('Level');
                const stage = gameRef.current?.closest('.game-table-page__row--middle');
                if (!level?.table || !stage || !game.canvas) return;
                const canvas = game.canvas.getBoundingClientRect();
                const area = stage.getBoundingClientRect();
                if (!canvas.width || !canvas.height || !area.height) return;
                const world = level.table.getBounds();
                const camera = level.cameras.main;
                const topLeft = camera.matrix.transformPoint(world.x - camera.scrollX, world.y - camera.scrollY);
                const bottomRight = camera.matrix.transformPoint(world.right - camera.scrollX, world.bottom - camera.scrollY);
                const bounds = { x: topLeft.x, y: topLeft.y, width: bottomRight.x - topLeft.x, height: bottomRight.y - topLeft.y };
                const key = ['desktop', canvas.x, canvas.y, canvas.width, canvas.height, area.x, area.y, bounds.x, bounds.y, bounds.width, bounds.height].join(',');
                if (key === lastLayoutKey) return;
                const seats = tableRailSeats({ bounds, canvas, area, gameSize: game.scale.gameSize });
                const rail = stage.querySelector('.game-table-page__seat-overlay');
                rail?.classList.remove('is-auto-positioned');
                rail?.classList.add('is-table-anchored');
                const tableHeight = bounds.height * canvas.height / game.scale.gameSize.height;
                const avatarSize = Math.min(clampNumber(gameElementControls.playerProfile?.avatarSizePx, 60, 24, 120), Math.max(32, tableHeight * .21 - 30));
                rail?.style.setProperty('--rail-avatar-size', `${avatarSize}px`);
                Object.entries(seats).forEach(([seat, point]) => {
                    rail?.style.setProperty(`--seat-${seat}-x`, `${point.x}px`);
                    rail?.style.setProperty(`--seat-${seat}-y`, `${point.y}px`);
                });
                lastLayoutKey = key;
                return;
            }
            const table = game.scene.getScene('Level')?.table;
            const stage = gameRef.current?.closest('.game-table-page__row--middle');
            if (!table || !stage || !game.canvas) return;
            const canvas = game.canvas.getBoundingClientRect();
            const area = stage.getBoundingClientRect();
            if (!canvas.width || !canvas.height || !area.height) return;
            const key = ['mobile', canvas.x, canvas.y, canvas.width, canvas.height, area.x, area.y, area.width, area.height, table.x, table.y, table.scaleX, table.scaleY].join(',');
            if (key === lastLayoutKey) return;
            const layout = mobileTableLayout({ width: area.width, height: area.height, canvasWidth: canvas.width, imageRatio: table.height / table.width });
            const sx = canvas.width / game.scale.gameSize.width;
            const sy = canvas.height / game.scale.gameSize.height;
            const worldX = (area.x + layout.left + layout.width / 2 - canvas.x) / sx;
            const worldY = (area.y + layout.top + layout.height / 2 - canvas.y) / sy;
            const point = table.parentContainer?.getWorldTransformMatrix().applyInverse(worldX, worldY) || { x: worldX, y: worldY };
            table.setPosition(point.x, point.y);
            table.setScale(layout.width / sx / table.width, layout.height / sy / table.height);
            const level = game.scene.getScene('Level');
            if (level.container_pot_amount && level.oGameUILayoutBase) {
                level.container_pot_amount.y = level.oGameUILayoutBase.potY + (level.oGameUILayout?.potOffsetY || 0);
            }
            if (level.container_pot_amount && level.oPotAmount && area.height < 500) {
                const pot = level.oPotAmount.getBounds();
                const targetY = area.y + layout.top - 45;
                level.container_pot_amount.y += (targetY - canvas.y - (pot.y + pot.height / 2) * sy) / sy;
                level.registerFXOverlayPotAnchor();
            }
            const rail = stage.querySelector('.game-table-page__seat-overlay');
            rail?.classList.remove('is-table-anchored');
            rail?.classList.add('is-auto-positioned');
            Object.entries(layout.seats).forEach(([seat, point]) => {
                rail?.style.setProperty(`--seat-${seat}-x`, `${point.x}px`);
                rail?.style.setProperty(`--seat-${seat}-y`, `${point.y}px`);
            });
            lastLayoutKey = ['mobile', canvas.x, canvas.y, canvas.width, canvas.height, area.x, area.y, area.width, area.height, table.x, table.y, table.scaleX, table.scaleY].join(',');
        };
        game.events.on(Phaser.Core.Events.POST_RENDER, alignTableSeats);

        return () => {
            game.events.off(Phaser.Core.Events.POST_RENDER, alignTableSeats);
            hideGameActionOverlay();
            window.dispatchEvent(new CustomEvent('bsg:profile-refresh'));
            phaserGameRef.current = null;
            game.destroy(true);
        };

    }, [fallbackPath, isAutoJoining, isGuestTutorial, resolvedAuthToken, resolvedBoardId, sPrivateCode, tableOnlyMode, isProfileFetched, equippedTableTheme]);

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
