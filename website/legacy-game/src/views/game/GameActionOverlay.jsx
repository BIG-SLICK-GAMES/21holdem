import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getProfile } from '../../query/profile.query';
import { buyChips, getChips } from '../../query/shop.query';
import _ from '../../scripts/helper';
import DailyRewardsPanel from '../../shared/components/DailyRewardsPanel';
import rewardsIcon from '../../assets/images/icons/working/rewards.png';
import shopIcon from '../../assets/images/icons/working/shop.png';
import { chips1, chips2, chips3, chips4, chips5 } from '../../assets/images/shop/shop';
import clubImage from '../../assets/images/card/club.png';
import diamondImage from '../../assets/images/card/diamond.png';
import heartImage from '../../assets/images/card/heart.png';
import spadeImage from '../../assets/images/card/spades.png';
import cardFrontImage from '../../assets/images/card/card_front.png';
import {
    createHiddenGameActionOverlayState,
    emitGameActionOverlayCommand,
    GAME_ACTION_OVERLAY_STATE_EVENT,
} from '../../scripts/gameActionOverlayBridge';
import { GAME_BROWSER_EVENTS } from '../../scripts/gameEvents';
import { getAvatarImageSrc } from '../../shared/constants/builtInAvatars';
import { ReactToastify } from '../../shared/utils';

const DEBUG_CONSOLE_LAYOUT = false;
const ACTION_BUTTON_CLOSE_MS = 280;
const LOCAL_ACTION_PILL_MS = 1550;
const CONSOLE_LAYOUT_STYLE = {
    '--console-left-width': '36%',
    '--console-center-width': '36%',
    '--console-right-width': '28%',
};

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
    ? loadStripe(stripePublishableKey)
    : Promise.resolve(null);

function getArrayPayload(value) {
    return Array.isArray(value) ? value : [];
}

function getShopChipImage(nChips) {
    if (Number(nChips) <= 100) return chips1;
    if (Number(nChips) <= 500) return chips2;
    if (Number(nChips) <= 1000) return chips3;
    if (Number(nChips) <= 2500) return chips4;
    return chips5;
}

function formatStorePrice(nPrice, sCurrency = 'USD') {
    const nNumericPrice = Number(nPrice);
    if (!Number.isFinite(nNumericPrice)) return `${nPrice ?? '-'}`;

    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: sCurrency || 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(nNumericPrice);
    } catch (_error) {
        return `$${nNumericPrice.toFixed(2)}`;
    }
}

function getPreferredBankrollValue(...values) {
    const numericValues = values
        .map((value) => Number(value))
        .filter((value) => Number.isFinite(value));
    const positiveValue = numericValues.find((value) => value > 0);
    if (Number.isFinite(positiveValue)) return positiveValue;
    return numericValues.length ? numericValues[0] : null;
}

function formatBlindAmount(value) {
    const nValue = Number(value);
    if (!Number.isFinite(nValue) || nValue <= 0) return '';
    return Number.isInteger(nValue) ? String(nValue) : String(Number(nValue.toFixed(2)));
}

function formatWholeCurrency(value) {
    const nValue = Math.max(0, Math.round(Number(value) || 0));
    return String(nValue).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function SoundToggle() {
    const [audioState, setAudioState] = useState({ soundOn: true, musicOn: true });
    const [isOpen, setOpen] = useState(false);

    useEffect(() => {
        const onState = (e) => {
            setAudioState({
                soundOn: e?.detail?.soundOn !== false,
                musicOn: e?.detail?.musicOn !== false,
            });
        };
        window.addEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, onState);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, onState);
    }, []);

    const updateAudioSetting = (nextState) => {
        setAudioState(nextState);
        window.dispatchEvent(new CustomEvent(GAME_BROWSER_EVENTS.SOUND_SETTINGS_CHANGE, {
            detail: nextState,
        }));
    };
    const bMuted = !audioState.soundOn && !audioState.musicOn;
    const muted = bMuted;

    return (
        <>
        <button
            type='button'
            className={`sound-toggle${bMuted ? ' sound-toggle--muted' : ''}`}
            aria-label='Open audio settings'
            onClick={() => setOpen(true)}
        >
            {muted ? '🔇' : '🔊'}
        </button>
        {isOpen ? (
            <div
                className='game-audio-modal'
                role='dialog'
                aria-modal='true'
                aria-label='Audio settings'
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                <div className='game-audio-modal__panel'>
                    <div className='game-audio-modal__header'>
                        <strong>Audio</strong>
                        <button type='button' onClick={() => setOpen(false)} aria-label='Close audio settings'>x</button>
                    </div>
                    <label className='game-audio-modal__row'>
                        <span>Music</span>
                        <button
                            type='button'
                            className={audioState.musicOn ? 'is-on' : ''}
                            onClick={() => updateAudioSetting({ ...audioState, musicOn: !audioState.musicOn })}
                        >
                            {audioState.musicOn ? 'On' : 'Off'}
                        </button>
                    </label>
                    <label className='game-audio-modal__row'>
                        <span>FX</span>
                        <button
                            type='button'
                            className={audioState.soundOn ? 'is-on' : ''}
                            onClick={() => updateAudioSetting({ ...audioState, soundOn: !audioState.soundOn })}
                        >
                            {audioState.soundOn ? 'On' : 'Off'}
                        </button>
                    </label>
                </div>
            </div>
        ) : null}
        </>
    );
}

function ExitUtilityButton() {
    return (
        <button
            type='button'
            className='game-stage-utility__exit-btn'
            onClick={() => emitGameActionOverlayCommand('exitTable')}
            aria-label='Exit table'
        >
            Exit
        </button>
    );
}

const TABLE_TOP_UP_AMOUNTS = [500, 1000, 2500, 5000];

function getHoleCardLabel(card) {
    const nLabel = Number(card?.nLabel);
    if (nLabel === 1) return 'A';
    if (nLabel === 11) return 'J';
    if (nLabel === 12) return 'Q';
    if (nLabel === 13) return 'K';
    return String(card?.nLabel || '');
}

function getHoleCardSuit(card) {
    const sSuitKey = String(card?.eSuit || '').toLowerCase()[0];
    return {
        c: { image: clubImage, name: 'club', red: false },
        d: { image: diamondImage, name: 'diamond', red: true },
        h: { image: heartImage, name: 'heart', red: true },
        s: { image: spadeImage, name: 'spade', red: false },
    }[sSuitKey] || { image: spadeImage, name: 'spade', red: false };
}

function getHoleCardId(card, index = 0) {
    return String(card?._id || card?.id || `${card?.eSuit || 'card'}-${card?.nLabel || index}-${index}`);
}

function HoleCardDisplay({ cards, score, isFolded, revealCardId, onRevealCardToggle }) {
    const visibleCards = cards.slice(0, 2);
    if (!visibleCards.length) return null;

    return (
        <div className={`game-action-overlay__hole-card-display${isFolded ? ' is-folded' : ''}`} aria-label='Your hole cards'>
            <div className='game-action-overlay__hole-card-row'>
                {visibleCards.map((card, index) => {
                    const suit = getHoleCardSuit(card);
                    const label = getHoleCardLabel(card);
                    const key = getHoleCardId(card, index);
                    const bRevealSelected = key === revealCardId;
                    return (
                        <span className={`game-action-overlay__hole-card${suit.red ? ' is-red' : ''}${bRevealSelected ? ' is-reveal-selected' : ''}`} key={key}>
                            <img className='game-action-overlay__hole-card-face' src={cardFrontImage} alt='' draggable='false' />
                            <img className='game-action-overlay__hole-card-suit' src={suit.image} alt={suit.name} draggable='false' />
                            <strong>{label}</strong>
                            <button
                                type='button'
                                className={`game-action-overlay__hole-card-reveal-toggle${bRevealSelected ? ' is-active' : ''}`}
                                aria-label={bRevealSelected ? 'Do not show this card at showdown' : 'Show this card at showdown'}
                                aria-pressed={bRevealSelected}
                                onPointerDown={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                }}
                                onClick={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();
                                    onRevealCardToggle?.(bRevealSelected ? '' : key);
                                }}
                            >
                                <span className='game-action-overlay__hole-card-eye' />
                            </button>
                        </span>
                    );
                })}
                <span className='game-action-overlay__hole-card-total'>{Number(score) || 0}</span>
            </div>
        </div>
    );
}

HoleCardDisplay.propTypes = {
    cards: PropTypes.arrayOf(PropTypes.object),
    score: PropTypes.number,
    isFolded: PropTypes.bool,
    revealCardId: PropTypes.string,
    onRevealCardToggle: PropTypes.func,
};

HoleCardDisplay.defaultProps = {
    cards: [],
    score: 0,
    isFolded: false,
    revealCardId: '',
    onRevealCardToggle: null,
};

function GameUtilityModal({ type, visible, onClose, shopItems, isShopLoading, isBuyingShopItem, onBuyShopItem }) {
    if (!visible) return null;

    const bRewards = type === 'rewards';

    return (
        <div className='game-action-overlay__utility-modal' role='dialog' aria-modal='true' aria-label={bRewards ? 'Daily rewards' : 'Shop'}>
            <div className='game-action-overlay__utility-modal-backdrop' onClick={onClose} />
            <section className={`game-action-overlay__utility-panel game-action-overlay__utility-panel--${type}`}>
                <header className='game-action-overlay__utility-header'>
                    <strong>{bRewards ? 'Daily Rewards' : 'Chip Shop'}</strong>
                    <button type='button' onClick={onClose} aria-label='Close panel'>x</button>
                </header>

                {bRewards ? (
                    <DailyRewardsPanel embedded />
                ) : (
                    <div className='game-action-overlay__shop-grid'>
                        {isShopLoading ? (
                            <div className='game-action-overlay__utility-empty'>Loading store...</div>
                        ) : null}
                        {!isShopLoading && !shopItems.length ? (
                            <div className='game-action-overlay__utility-empty'>No chip packs available.</div>
                        ) : null}
                        {shopItems.map((item, index) => {
                            const sItemKey = `${item?.sTitle || 'chip-pack'}-${item?._id || item?.nPrice || index}`;
                            const nChips = Number(item?.nChips) || 0;
                            return (
                                <article className='game-action-overlay__shop-item' key={sItemKey}>
                                    <img src={getShopChipImage(nChips)} alt='' />
                                    <div>
                                        <strong>{item?.sTitle || 'Chip Package'}</strong>
                                        <span>{nChips ? `${_.formatCurrencyWithComa(nChips)} chips` : 'Chip pack'}</span>
                                    </div>
                                    <button
                                        type='button'
                                        onClick={() => onBuyShopItem(item)}
                                        disabled={isBuyingShopItem}
                                    >
                                        {isBuyingShopItem ? 'Processing' : formatStorePrice(item?.nPrice, item?.sCurrency)}
                                    </button>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}

GameUtilityModal.propTypes = {
    type: PropTypes.oneOf(['rewards', 'shop']),
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    shopItems: PropTypes.arrayOf(PropTypes.object),
    isShopLoading: PropTypes.bool,
    isBuyingShopItem: PropTypes.bool,
    onBuyShopItem: PropTypes.func.isRequired,
};

GameUtilityModal.defaultProps = {
    type: 'rewards',
    shopItems: [],
    isShopLoading: false,
    isBuyingShopItem: false,
};

function TableTopUpModal({ visible, amount, autoTopUp, tableBankroll, fullBankroll, onAmountChange, onAutoTopUpChange, onSubmit, onClose }) {
    if (!visible) return null;

    return (
        <div className='game-action-overlay__top-up-modal' role='dialog' aria-modal='true' aria-label='Top up table bankroll'>
            <div className='game-action-overlay__top-up-backdrop' onClick={onClose} />
            <section className='game-action-overlay__top-up-panel'>
                <header className='game-action-overlay__top-up-header'>
                    <strong>Top Up Table</strong>
                    <button type='button' onClick={onClose} aria-label='Close table top up'>x</button>
                </header>
                <div className='game-action-overlay__top-up-balances'>
                    <div>
                        <span>Full Bankroll</span>
                        <strong>{fullBankroll}</strong>
                    </div>
                    <div>
                        <span>Table</span>
                        <strong>{tableBankroll}</strong>
                    </div>
                </div>
                <div className='game-action-overlay__top-up-options'>
                    {TABLE_TOP_UP_AMOUNTS.map((value) => (
                        <button
                            key={value}
                            type='button'
                            className={Number(amount) === value ? 'is-selected' : ''}
                            onClick={() => onAmountChange(value)}
                        >
                            {_.formatCurrencyWithComa(value)}
                        </button>
                    ))}
                </div>
                <label className='game-action-overlay__top-up-toggle'>
                    <input
                        type='checkbox'
                        checked={autoTopUp}
                        onChange={(event) => onAutoTopUpChange(event.target.checked)}
                    />
                    <span>Auto top up after each loss</span>
                </label>
                <button type='button' className='game-action-overlay__top-up-submit' onClick={onSubmit}>
                    Top Up
                </button>
            </section>
        </div>
    );
}

TableTopUpModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    amount: PropTypes.number.isRequired,
    autoTopUp: PropTypes.bool.isRequired,
    tableBankroll: PropTypes.string.isRequired,
    fullBankroll: PropTypes.string.isRequired,
    onAmountChange: PropTypes.func.isRequired,
    onAutoTopUpChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
};

const BUTTON_CLASS_BY_VARIANT = {
    primary: 'guest-entry-btn',
    secondary: 'about-entry-btn',
};

// eslint-disable-next-line react/prop-types
function GameActionOverlay({ isPaused = false }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [overlayState, setOverlayState] = useState(() => createHiddenGameActionOverlayState());
    const [consoleCards, setConsoleCards] = useState({ hand: [], community: [], score: 0, isFolded: false });
    const [sRevealCardId, setRevealCardId] = useState('');
    const [turnTimer, setTurnTimer] = useState({ active: false, endsAt: 0, totalMs: 0 });
    const [clockNow, setClockNow] = useState(() => Date.now());
    const [consoleWin, setConsoleWin] = useState({ visible: false, amount: 0, token: 0 });
    const [consoleBust, setConsoleBust] = useState({ active: false, token: 0 });
    const [localActionPill, setLocalActionPill] = useState({ visible: false, label: '', token: 0 });
    const [utilityModal, setUtilityModal] = useState('');
    const [bTopUpModalOpen, setTopUpModalOpen] = useState(false);
    const [nTopUpAmount, setTopUpAmount] = useState(1000);
    const [bAutoTopUp, setAutoTopUp] = useState(() => (
        typeof window !== 'undefined' && window.localStorage?.getItem('bsg:auto-table-top-up') === '1'
    ));
    const { data: profileData } = useQuery('profileData', getProfile, {
        select: (data) => data?.data?.data,
        refetchOnWindowFocus: false,
    });
    const { data: shopItems = [], isLoading: isShopLoading } = useQuery('getChips', getChips, {
        select: (data) => getArrayPayload(data?.data?.data),
        enabled: utilityModal === 'shop',
        onError: (error) => {
            ReactToastify(error?.response?.data?.message || 'Unable to load store items', 'error');
        },
    });
    const { mutate: mutateBuyChips, isLoading: isBuyingShopItem } = useMutation(buyChips, {
        onSuccess: async (response) => {
            const payload = response?.data;
            if (response?.status === 200 && payload?.data?.sessionId) {
                const stripe = await stripePromise;
                if (!stripe) {
                    if (payload?.data?.checkoutUrl) {
                        window.location.assign(payload.data.checkoutUrl);
                        return;
                    }
                    ReactToastify('Stripe publishable key is not configured and checkout URL was not returned', 'error');
                    return;
                }
                const { error } = await stripe.redirectToCheckout({ sessionId: payload.data.sessionId });
                if (error && payload?.data?.checkoutUrl) {
                    window.location.assign(payload.data.checkoutUrl);
                    return;
                }
                if (error) ReactToastify(error.message || 'Stripe redirect failed', 'error');
                return;
            }

            if (payload?.status === 200 || response?.status === 200) {
                ReactToastify(payload?.message || 'Purchase successful', 'success');
                queryClient.invalidateQueries('profileData');
                queryClient.invalidateQueries('layout-profile');
                return;
            }

            ReactToastify(payload?.message || 'Unable to complete purchase', 'error');
        },
        onError: (error) => {
            ReactToastify(error?.response?.data?.message || 'Unable to complete purchase', 'error');
        },
    });
    const turnTimerRemainingMs = turnTimer.active && turnTimer.endsAt
        ? Math.max(0, turnTimer.endsAt - clockNow)
        : 0;
    const turnTimerProgress = turnTimer.active && turnTimer.totalMs > 0
        ? Math.max(0, Math.min(1, turnTimerRemainingMs / turnTimer.totalMs))
        : 0;
    const consoleAvatarStyle = {
        '--turn-progress': `${turnTimerProgress * 100}%`,
    };

    const handleRevealCardToggle = (cardId) => {
        const nextCardId = String(cardId || '');
        setRevealCardId(nextCardId);
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(GAME_BROWSER_EVENTS.SHOWDOWN_CARD_REVEAL_CHANGE, {
            detail: {
                sCardId: nextCardId,
            },
        }));
    };

    const handleBuyShopItem = (item) => {
        if (!item || isBuyingShopItem) return;
        mutateBuyChips({ nPrice: item.nPrice });
    };

    const handleSubmitTableTopUp = () => {
        const nAmount = Math.max(0, Number(nTopUpAmount) || 0);
        if (!nAmount) return;
        emitGameActionOverlayCommand('topUpTable', {
            amount: nAmount,
            autoTopUp: bAutoTopUp,
        });
        setTopUpModalOpen(false);
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.localStorage?.setItem('bsg:auto-table-top-up', bAutoTopUp ? '1' : '0');
    }, [bAutoTopUp]);

    useEffect(() => {
        const handleConsoleCards = (event) => {
            setConsoleCards({
                hand: Array.isArray(event?.detail?.hand) ? event.detail.hand : [],
                community: Array.isArray(event?.detail?.community) ? event.detail.community : [],
                score: Number(event?.detail?.score) || 0,
                isFolded: Boolean(event?.detail?.isFolded),
            });
        };

        window.addEventListener(GAME_BROWSER_EVENTS.CONSOLE_CARDS, handleConsoleCards);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.CONSOLE_CARDS, handleConsoleCards);
    }, []);

    const sHandSignature = useMemo(
        () => consoleCards.hand.map((card, index) => getHoleCardId(card, index)).join('|'),
        [consoleCards.hand]
    );

    useEffect(() => {
        setRevealCardId('');
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(GAME_BROWSER_EVENTS.SHOWDOWN_CARD_REVEAL_CHANGE, {
            detail: {
                sCardId: '',
            },
        }));
    }, [sHandSignature]);

    useEffect(() => {
        const handleConsoleTimer = (event) => {
            const bActive = Boolean(event?.detail?.active);
            const nRemainingMs = Math.max(0, Number(event?.detail?.remainingMs) || 0);
            const nTotalMs = Math.max(0, Number(event?.detail?.totalMs) || 0);
            setTurnTimer({
                active: bActive && nRemainingMs > 0 && nTotalMs > 0,
                endsAt: bActive && nRemainingMs > 0 ? Date.now() + nRemainingMs : 0,
                totalMs: nTotalMs,
            });
        };

        window.addEventListener(GAME_BROWSER_EVENTS.CONSOLE_TURN_TIMER, handleConsoleTimer);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.CONSOLE_TURN_TIMER, handleConsoleTimer);
    }, []);

    useEffect(() => {
        const bNeedsClock = turnTimer.active && turnTimer.endsAt > clockNow;
        if (!bNeedsClock) return undefined;
        const timer = window.setInterval(() => setClockNow(Date.now()), 250);

        return () => window.clearInterval(timer);
    }, [clockNow, turnTimer.active, turnTimer.endsAt]);

    useEffect(() => {
        if (!turnTimer.active || !turnTimer.endsAt || clockNow < turnTimer.endsAt) return undefined;
        setTurnTimer((currentTimer) => ({ ...currentTimer, active: false, endsAt: 0 }));
        return undefined;
    }, [clockNow, turnTimer.active, turnTimer.endsAt]);

    useEffect(() => {
        const handleConsoleWin = (event) => {
            const nAmount = Math.max(0, Number(event?.detail?.amount) || 0);
            const nToken = Date.now();
            setConsoleWin({ visible: true, amount: nAmount, token: nToken });
            window.setTimeout(() => {
                setConsoleWin((current) => (current.token === nToken ? { visible: false, amount: 0, token: 0 } : current));
            }, 7200);
        };

        window.addEventListener(GAME_BROWSER_EVENTS.CONSOLE_WIN, handleConsoleWin);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.CONSOLE_WIN, handleConsoleWin);
    }, []);

    useEffect(() => {
        const handleConsoleBust = () => {
            const nToken = Date.now();
            setConsoleBust({ active: true, token: nToken });
            window.setTimeout(() => {
                setConsoleBust((current) => (current.token === nToken ? { active: false, token: 0 } : current));
            }, 1300);
        };

        window.addEventListener(GAME_BROWSER_EVENTS.CONSOLE_BUST, handleConsoleBust);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.CONSOLE_BUST, handleConsoleBust);
    }, []);

    useEffect(() => {
        const handleStateUpdate = (event) => {
            setOverlayState({
                ...createHiddenGameActionOverlayState(),
                ...(event?.detail || {}),
            });
        };

        const handleNavigate = (event) => {
            const sPath = event?.detail?.path;
            if (sPath) navigate(sPath);
        };

        const handleProfileRefresh = () => {
            queryClient.invalidateQueries('profileData');
            queryClient.invalidateQueries('layout-profile');
        };

        window.addEventListener(GAME_ACTION_OVERLAY_STATE_EVENT, handleStateUpdate);
        window.addEventListener(GAME_BROWSER_EVENTS.NAVIGATE, handleNavigate);
        window.addEventListener(GAME_BROWSER_EVENTS.PROFILE_REFRESH, handleProfileRefresh);
        return () => {
            window.removeEventListener(GAME_ACTION_OVERLAY_STATE_EVENT, handleStateUpdate);
            window.removeEventListener(GAME_BROWSER_EVENTS.NAVIGATE, handleNavigate);
            window.removeEventListener(GAME_BROWSER_EVENTS.PROFILE_REFRESH, handleProfileRefresh);
        };
    }, [navigate, queryClient]);

    const rows = useMemo(() => Array.isArray(overlayState.rows) ? overlayState.rows : [], [overlayState.rows]);
    const hasButtons = useMemo(() => rows.some((row) => {
        const rowButtons = Array.isArray(row?.buttons) ? row.buttons.filter(Boolean) : [];
        return rowButtons.length > 0;
    }), [rows]);
    const actionRowsSignature = useMemo(() => rows.map((row) => {
        const rowButtons = Array.isArray(row?.buttons) ? row.buttons.filter(Boolean) : [];
        return [
            row?.id || '',
            row?.className || '',
            rowButtons.map((button) => [
                button?.key || '',
                button?.label || '',
                button?.variant || '',
                button?.widthClass || '',
                button?.amount ?? '',
                button?.disabled ? 'disabled' : 'enabled',
            ].join('|')).join(','),
        ].join(':');
    }).join(';'), [rows]);
    const latestRowsRef = useRef(rows);
    const displayedRowsRef = useRef([]);
    const openTimerRef = useRef(null);
    const closeTimerRef = useRef(null);
    const localActionTimerRef = useRef(null);
    const [displayedRows, setDisplayedRows] = useState([]);
    const [buttonTrayMotion, setButtonTrayMotion] = useState('hidden');
    const hasMessage = Boolean(overlayState.message);
    const tableBankrollAmount = Number.isFinite(Number(overlayState.tableBankroll))
        ? formatWholeCurrency(overlayState.tableBankroll)
        : '--';
    const nLiveTableBankroll = Number(overlayState.tableBankroll);
    const nProfileBankroll = Number(profileData?.nChips);
    const nConsoleBankroll = getPreferredBankrollValue(nProfileBankroll, nLiveTableBankroll);
    const bankrollAmount = Number.isFinite(Number(nConsoleBankroll)) ? formatWholeCurrency(nConsoleBankroll) : '--';
    const nBigBlind = Number(overlayState.bigBlind);
    const nSmallBlind = Number(overlayState.smallBlind);
    const sBlindLabel = Number.isFinite(nBigBlind) && nBigBlind > 0
        ? `${formatBlindAmount(Number.isFinite(nSmallBlind) && nSmallBlind > 0 ? nSmallBlind : nBigBlind / 2)}/${formatBlindAmount(nBigBlind)}`
        : '';
    const sConsoleName = profileData?.sUserName || 'Player';
    const sConsoleAvatar = getAvatarImageSrc(profileData?.sAvatar, sConsoleName) || getAvatarImageSrc('', sConsoleName);
    const isVisible = Boolean(overlayState.visible);
    const bHasHoleCards = consoleCards.hand.length > 0;
    const bKeepConsoleVisible = isVisible || bHasHoleCards;

    useEffect(() => {
        latestRowsRef.current = rows;
    }, [rows]);

    useEffect(() => () => {
        if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
        if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
        if (localActionTimerRef.current) window.clearTimeout(localActionTimerRef.current);
    }, []);

    const showLocalActionPill = (label) => {
        const sLabel = String(label || '').trim();
        if (!sLabel) return;

        if (localActionTimerRef.current) window.clearTimeout(localActionTimerRef.current);

        const nToken = Date.now();
        setLocalActionPill({ visible: true, label: sLabel, token: nToken });
        localActionTimerRef.current = window.setTimeout(() => {
            setLocalActionPill((current) => (current.token === nToken ? { visible: false, label: '', token: 0 } : current));
        }, LOCAL_ACTION_PILL_MS);
    };

    useEffect(() => {
        if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
        if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);

        if (hasButtons) {
            const nextRows = latestRowsRef.current;
            displayedRowsRef.current = nextRows;
            setDisplayedRows(nextRows);
            setButtonTrayMotion('opening');
            openTimerRef.current = window.setTimeout(() => {
                setButtonTrayMotion('visible');
            }, 220);
            return () => {
                if (openTimerRef.current) window.clearTimeout(openTimerRef.current);
            };
        }

        if (displayedRowsRef.current.length) {
            setButtonTrayMotion('closing');
            closeTimerRef.current = window.setTimeout(() => {
                displayedRowsRef.current = [];
                setDisplayedRows([]);
                setButtonTrayMotion('hidden');
            }, ACTION_BUTTON_CLOSE_MS);
            return () => {
                if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
            };
        }

        setButtonTrayMotion('hidden');
        return undefined;
    }, [actionRowsSignature, hasButtons]);

    const hasDisplayedButtons = displayedRows.some((row) => {
        const rowButtons = Array.isArray(row?.buttons) ? row.buttons.filter(Boolean) : [];
        return rowButtons.length > 0;
    });

    return (
        <>
            <div className='game-stage-utility' aria-label='Game utility controls'>
                {sBlindLabel ? (
                    <div className='game-stage-utility__blind' aria-label={`Table blinds ${sBlindLabel}`}>
                        <span>Blinds</span>
                        <strong>{sBlindLabel}</strong>
                    </div>
                ) : null}
                <div className='game-stage-utility__actions'>
                    <button
                        type='button'
                        className='game-stage-utility__icon-btn'
                        onClick={() => setUtilityModal('rewards')}
                        aria-label='Open daily rewards'
                    >
                        <img src={rewardsIcon} alt='' />
                    </button>
                    <button
                        type='button'
                        className='game-stage-utility__icon-btn'
                        onClick={() => setUtilityModal('shop')}
                        aria-label='Open chip shop'
                    >
                        <img src={shopIcon} alt='' />
                    </button>
                    <SoundToggle />
                    <ExitUtilityButton />
                </div>
            </div>
            <GameUtilityModal
                type={utilityModal || 'rewards'}
                visible={Boolean(utilityModal)}
                onClose={() => setUtilityModal('')}
                shopItems={shopItems}
                isShopLoading={isShopLoading}
                isBuyingShopItem={isBuyingShopItem}
                onBuyShopItem={handleBuyShopItem}
            />
            <TableTopUpModal
                visible={bTopUpModalOpen}
                amount={nTopUpAmount}
                autoTopUp={bAutoTopUp}
                tableBankroll={tableBankrollAmount}
                fullBankroll={bankrollAmount}
                onAmountChange={setTopUpAmount}
                onAutoTopUpChange={setAutoTopUp}
                onSubmit={handleSubmitTableTopUp}
                onClose={() => setTopUpModalOpen(false)}
            />
            <div className={`game-action-overlay ${bKeepConsoleVisible ? 'is-visible' : ''}`.trim()}>
            <div className='game-action-overlay__shell'>
                {hasMessage ? (
                    <div className='game-action-overlay__message'>
                        {overlayState.message}
                    </div>
                ) : null}
                <div className='game-action-overlay__tray'>
                    {hasDisplayedButtons ? (
                        <div className={`game-action-overlay__rows game-action-overlay__rows--interactive is-${buttonTrayMotion}${DEBUG_CONSOLE_LAYOUT ? ' is-debug-layout' : ''}`}>
                            {displayedRows.map((row, rowIndex) => {
                                const rowButtons = Array.isArray(row?.buttons) ? row.buttons.filter(Boolean) : [];
                                if (!rowButtons.length) return null;

                                return (
                                    <div
                                        key={row.id || `row-${rowIndex}`}
                                        className={`game-action-overlay__row auth-intro-actions ${row.className || ''}`.trim()}
                                    >
                                        {rowButtons.map((button, buttonIndex) => {
                                            const variantClass = BUTTON_CLASS_BY_VARIANT[button.variant] || BUTTON_CLASS_BY_VARIANT.secondary;
                                            const widthClass = button.widthClass || '';
                                            const nButtonIndex = (rowIndex * 4) + buttonIndex;

                                            return (
                                                <Button
                                                    key={button.key}
                                                    type='button'
                                                    className={`${variantClass} ${widthClass}`.trim()}
                                                    data-game-action-key={button.key}
                                                    disabled={isPaused || button.disabled}
                                                    style={{ '--action-button-delay': `${nButtonIndex * 28}ms` }}
                                                    onClick={() => {
                                                        if (button.submitsAction) showLocalActionPill(button.actionLabel || button.label);
                                                        setButtonTrayMotion('closing');
                                                        emitGameActionOverlayCommand(button.key, {
                                                            amount: button.amount,
                                                        });
                                                    }}
                                                >
                                                    {button.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    ) : null}
                    <div
                        className={`game-action-overlay__console-shell${DEBUG_CONSOLE_LAYOUT ? ' is-debug-layout' : ''}${consoleWin.visible ? ' is-winning' : ''}${turnTimer.active ? ' is-my-turn' : ''}${consoleBust.active ? ' is-bust' : ''}`}
                        style={CONSOLE_LAYOUT_STYLE}
                    >
                        {localActionPill.visible ? (
                            <div className='game-action-overlay__local-action-pill' key={localActionPill.token} aria-live='polite'>
                                {localActionPill.label}
                            </div>
                        ) : null}
                        {consoleWin.visible ? (
                            <div className='game-action-overlay__console-win' aria-live='polite'>
                                <span className='game-action-overlay__console-win-crown'>♛</span>
                                <strong>+{_.formatCurrencyWithComa(consoleWin.amount)}</strong>
                            </div>
                        ) : null}
                        <div className='game-action-overlay__console-col game-action-overlay__console-col--left'>
                            <div className={`game-action-overlay__console-avatar${turnTimer.active ? ' is-timing' : ''}`} style={consoleAvatarStyle}>
                                {sConsoleAvatar ? (
                                    <img src={sConsoleAvatar} alt='' draggable='false' />
                                ) : (
                                    <span>{String(sConsoleName).slice(0, 2).toUpperCase()}</span>
                                )}
                            </div>
                            <div className='game-action-overlay__console-bankroll'>
                                <span className='game-action-overlay__console-name'>{_.appendSuffix(sConsoleName, 14)}</span>
                                <strong>{bankrollAmount}</strong>
                            </div>
                        </div>
                        <div className='game-action-overlay__console-col game-action-overlay__console-col--center'>
                            {bHasHoleCards ? (
                                <HoleCardDisplay
                                    cards={consoleCards.hand}
                                    score={consoleCards.score}
                                    isFolded={consoleCards.isFolded}
                                    revealCardId={sRevealCardId}
                                    onRevealCardToggle={handleRevealCardToggle}
                                />
                            ) : null}
                        </div>
                        <div className='game-action-overlay__console-col game-action-overlay__console-col--right'>
                            <div className='game-action-overlay__table-bankroll'>
                                <div>
                                    <span>Table</span>
                                    <strong>{tableBankrollAmount}</strong>
                                </div>
                                <button
                                    type='button'
                                    className='game-action-overlay__table-bankroll-top-up'
                                    onClick={() => setTopUpModalOpen(true)}
                                    aria-label='Top up table bankroll'
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}

export default GameActionOverlay;
