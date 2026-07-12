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
import chipIcon from '../../assets/images/gameplay/chip_icon.png';
import rewardsIcon from '../../assets/images/icons/working/rewards.png';
import shopIcon from '../../assets/images/icons/working/shop.png';
import { chips1, chips2, chips3, chips4, chips5 } from '../../assets/images/shop/shop';
import twentyOneIcon from '../../assets/images/icons/new21.png';
import flushIcon from '../../assets/images/icons/newflush.png';
import straightIcon from '../../assets/images/icons/newstraight.png';
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
const CONSOLE_LAYOUT_STYLE = {
    '--console-left-width': '36%',
    '--console-center-width': '36%',
    '--console-right-width': '28%',
};

const stripePromise = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY
    ? loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY)
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

const SIDE_BET_STEP = 100;
const SIDE_BET_MAX = 5000;
const SIDE_BET_INFO_DISMISSED_STORAGE_KEY = 'bsg:side-bet-info-dismissed';
const SIDE_BET_INFO = [
    { title: '21', text: 'Your final hand total is exactly 21. Pays 3:1 plus your stake.' },
    { title: 'Flush', text: 'Your card and community cards make three or more cards of one suit. Pays 4:1 plus your stake.' },
    { title: 'Straight', text: 'Your card and community cards make three or more running ranks. Pays 5:1 plus your stake.' },
    { title: 'Straight Flush', text: 'A qualifying straight is also all one suit. Pays 10:1 on the Straight side bet.' },
];

const SIDE_BET_OPTIONS = [
    {
        id: 'straight',
        label: 'Straight',
        payout: 'Pays 5:1',
        icon: straightIcon,
        fallback: '',
        variant: 'straight',
    },
    {
        id: 'flush',
        label: 'Flush',
        payout: 'Pays 4:1',
        icon: flushIcon,
        fallback: 'Flush',
        variant: 'flush',
    },
    {
        id: 'twenty-one',
        label: '21',
        payout: 'Pays 3:1',
        icon: twentyOneIcon,
        fallback: '',
        variant: 'twenty-one',
    },
];
const TABLE_TOP_UP_AMOUNTS = [500, 1000, 2500, 5000];

const createInitialSideBets = () => SIDE_BET_OPTIONS.reduce((accumulator, option) => ({
    ...accumulator,
    [option.id]: 0,
}), {});

function SideBetsModule({ bets, disabled = false, isFocus = false, isTable = false, showHeading = false, showAddButtons = false, statuses = {}, unitAmount = SIDE_BET_STEP, onAdd, onClear }) {
    const stopSideBetPointer = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };

    return (
        <div
            className={`game-action-overlay__side-bets container_side_bets${isFocus ? ' game-action-overlay__side-bets--focus' : ''}${isTable ? ' game-action-overlay__side-bets--table' : ''}`}
            aria-label='Side bets'
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
        >
            {isTable && showHeading ? (
                <div className='game-action-overlay__side-bets-arc' aria-hidden='true'>
                    <span>Place Side Bets</span>
                </div>
            ) : null}
            {!isTable && showHeading ? (
                <div className='game-action-overlay__side-bets-heading'>
                    <strong>Place Your Sidebets</strong>
                    <span>Choose before the countdown ends</span>
                </div>
            ) : null}
            <div className='game-action-overlay__side-bets-rows'>
                {SIDE_BET_OPTIONS.map((bet) => {
                    const nBetAmount = Number(bets[bet.id]) || 0;
                    const bActive = nBetAmount > 0 && !statuses[bet.id]?.unqualified;
                    return (
                    <div className={`game-action-overlay__side-bet${!nBetAmount ? ' is-empty' : ''}${bActive ? ' is-active' : ''}${statuses[bet.id]?.unqualified ? ' is-unqualified' : ''}${statuses[bet.id]?.paid ? ' is-paid' : ''}`} key={bet.id}>
                        <button
                            type='button'
                            className={`game-action-overlay__side-bet-icon game-action-overlay__side-bet-icon--${bet.variant}`}
                            aria-label={`Add ${_.formatCurrencyWithComa(unitAmount)} chips to ${bet.label}`}
                            disabled={disabled}
                            onPointerDown={stopSideBetPointer}
                            onClick={(event) => {
                                stopSideBetPointer(event);
                                onAdd(bet.id);
                            }}
                        >
                            {bet.icon ? (
                                <img src={bet.icon} alt='' draggable='false' />
                            ) : (
                                <span>{bet.fallback}</span>
                            )}
                        </button>
                        {showAddButtons ? (
                            <button
                                type='button'
                                className='game-action-overlay__side-bet-add'
                                aria-label={`Add ${_.formatCurrencyWithComa(unitAmount)} chips to ${bet.label}`}
                                disabled={disabled}
                                onPointerDown={stopSideBetPointer}
                                onClick={(event) => {
                                    stopSideBetPointer(event);
                                    onAdd(bet.id);
                                }}
                            >
                                +
                            </button>
                        ) : null}
                        {nBetAmount ? (
                            <button
                                type='button'
                                className='game-action-overlay__side-bet-badge'
                                aria-label={`Clear ${bet.label} side bet`}
                                disabled={disabled}
                                onPointerDown={stopSideBetPointer}
                                onClick={(event) => {
                                    stopSideBetPointer(event);
                                    onClear(bet.id);
                                }}
                            >
                                <img src={chipIcon} alt='' draggable='false' />
                                <span>{_.formatCurrencyWithComa(nBetAmount)}</span>
                            </button>
                        ) : null}
                        {statuses[bet.id]?.paid ? (
                            <span className='game-action-overlay__side-bet-paid'>
                                +{_.formatCurrencyWithComa(statuses[bet.id].paid)}
                            </span>
                        ) : null}
                        {showHeading ? (
                            <span className='game-action-overlay__side-bet-copy'>
                                <strong>{bet.label}</strong>
                                <small>{bet.payout}</small>
                            </span>
                        ) : null}
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

SideBetsModule.propTypes = {
    bets: PropTypes.objectOf(PropTypes.number).isRequired,
    disabled: PropTypes.bool,
    isFocus: PropTypes.bool,
    isTable: PropTypes.bool,
    showHeading: PropTypes.bool,
    showAddButtons: PropTypes.bool,
    statuses: PropTypes.objectOf(PropTypes.shape({
        unqualified: PropTypes.bool,
        paid: PropTypes.number,
    })),
    unitAmount: PropTypes.number,
    onAdd: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired,
};

SideBetsModule.defaultProps = {
    disabled: false,
    isFocus: false,
    isTable: false,
    showHeading: false,
    showAddButtons: false,
    statuses: {},
    unitAmount: SIDE_BET_STEP,
};

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

function hasCardRun(cards = [], nMinimumLength = 3) {
    const ranks = [...new Set(cards.map((card) => {
        const nLabel = Number(card?.nLabel);
        if (nLabel === 1) return 14;
        return nLabel;
    }).filter((rank) => rank > 0))].sort((a, b) => a - b);
    if (ranks.includes(14)) ranks.unshift(1);

    let nRun = 1;
    for (let index = 1; index < ranks.length; index += 1) {
        if (ranks[index] === ranks[index - 1] + 1) {
            nRun += 1;
            if (nRun >= nMinimumLength) return true;
        } else if (ranks[index] !== ranks[index - 1]) {
            nRun = 1;
        }
    }

    return false;
}

function getSideBetStatuses(handCards = [], communityCards = [], sideBetLive = true) {
    const cards = [...handCards, ...communityCards];
    const nRemainingCommunityCards = Math.max(0, 5 - communityCards.length);
    const nScore = cards.reduce((sum, card) => sum + (Number(card?.nValue) || 0), 0);
    const bTriggerWindowClosed = communityCards.length >= 2 || sideBetLive === false;
    const suitCounts = cards.reduce((accumulator, card) => {
        const suit = String(card?.eSuit || '').toLowerCase();
        if (!suit) return accumulator;
        accumulator[suit] = (accumulator[suit] || 0) + 1;
        return accumulator;
    }, {});
    const nMaxSuitCount = Math.max(0, ...Object.values(suitCounts));
    const bFlushTriggered = cards.length >= 3 && nMaxSuitCount >= 3;
    const bStraightTriggered = cards.length >= 3 && hasCardRun(cards, 3);
    const bTwentyOneTriggered = nScore === 21;

    return {
        'twenty-one': {
            unqualified: cards.length > 0 && (nScore > 21 || (bTriggerWindowClosed && !bTwentyOneTriggered)),
        },
        flush: {
            unqualified: cards.length > 0 && ((bTriggerWindowClosed && !bFlushTriggered) || (sideBetLive && nMaxSuitCount + nRemainingCommunityCards < 3)),
        },
        straight: {
            unqualified: cards.length > 0 && ((bTriggerWindowClosed && !bStraightTriggered) || (sideBetLive && communityCards.length >= 5 && !bStraightTriggered)),
        },
    };
}

function normalizeSideBetPayouts(detail = {}) {
    const source = detail?.payouts && typeof detail.payouts === 'object' ? detail.payouts : {};
    const payouts = SIDE_BET_OPTIONS.reduce((accumulator, option) => {
        const rawValue = source[option.id] ?? source[option.label] ?? source[option.variant];
        const nValue = Number(rawValue);
        if (Number.isFinite(nValue) && nValue > 0) accumulator[option.id] = nValue;
        return accumulator;
    }, {});
    const nWinningAmount = Number(detail?.nWinningAmount);

    return {
        payouts,
        total: Number.isFinite(nWinningAmount) && nWinningAmount > 0
            ? nWinningAmount
            : Object.values(payouts).reduce((sum, amount) => sum + amount, 0),
        message: String(detail?.message || '').trim(),
        expiresAt: Date.now() + 3400,
    };
}

function SideBetInfoDialog({ visible, onClose, dontShowAgain, onDontShowAgainChange }) {
    if (!visible) return null;

    return (
        <div className='game-action-overlay__side-bet-info-dialog' role='dialog' aria-modal='true' aria-label='Side bet payouts'>
            <div className='game-action-overlay__side-bet-info-panel'>
                <button type='button' className='game-action-overlay__side-bet-info-close' onClick={onClose} aria-label='Close side bet payouts'>
                    ×
                </button>
                <strong>Side Bet Payouts</strong>
                <div className='game-action-overlay__side-bet-info-list'>
                    {SIDE_BET_INFO.map((item) => (
                        <div key={item.title}>
                            <span>{item.title}</span>
                            <p>{item.text}</p>
                        </div>
                    ))}
                </div>
                <label className='game-action-overlay__side-bet-info-dismiss'>
                    <input
                        type='checkbox'
                        checked={dontShowAgain}
                        onChange={(event) => onDontShowAgainChange(event.target.checked)}
                    />
                    <span>Don&apos;t show again</span>
                </label>
            </div>
        </div>
    );
}

SideBetInfoDialog.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    dontShowAgain: PropTypes.bool.isRequired,
    onDontShowAgainChange: PropTypes.func.isRequired,
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
    const bAutoSideBetInfoShownRef = useRef(false);
    const [overlayState, setOverlayState] = useState(() => createHiddenGameActionOverlayState());
    const [sideBets, setSideBets] = useState(createInitialSideBets);
    const [sideBetWindow, setSideBetWindow] = useState({
        visible: false,
        dismissed: false,
        endsAt: 0,
    });
    const [sideBetPayout, setSideBetPayout] = useState({ payouts: {}, total: 0, message: '', expiresAt: 0 });
    const [consoleCards, setConsoleCards] = useState({ hand: [], community: [], sideBetCommunity: [], sideBetLive: true, score: 0, isFolded: false });
    const [sRevealCardId, setRevealCardId] = useState('');
    const [turnTimer, setTurnTimer] = useState({ active: false, endsAt: 0, totalMs: 0 });
    const [sideBetUnitAmount, setSideBetUnitAmount] = useState(SIDE_BET_STEP);
    const [blindAmounts, setBlindAmounts] = useState({ smallBlind: null, bigBlind: null });
    const [bShowSideBetInfo, setShowSideBetInfo] = useState(false);
    const [bDontShowSideBetInfo, setDontShowSideBetInfo] = useState(() => (
        typeof window !== 'undefined' && window.localStorage?.getItem(SIDE_BET_INFO_DISMISSED_STORAGE_KEY) === '1'
    ));
    const [clockNow, setClockNow] = useState(() => Date.now());
    const [consoleWin, setConsoleWin] = useState({ visible: false, amount: 0, token: 0 });
    const [consoleBust, setConsoleBust] = useState({ active: false, token: 0 });
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
    const totalSideBets = Object.values(sideBets).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    const sideBetStatuses = useMemo(
        () => {
            const statuses = getSideBetStatuses(consoleCards.hand, consoleCards.sideBetCommunity, consoleCards.sideBetLive);
            Object.entries(sideBetPayout.payouts || {}).forEach(([id, amount]) => {
                statuses[id] = {
                    ...(statuses[id] || {}),
                    paid: Number(amount) || 0,
                };
            });
            return statuses;
        },
        [consoleCards.hand, consoleCards.sideBetCommunity, consoleCards.sideBetLive, sideBetPayout.payouts]
    );
    const sideBetSecondsRemaining = sideBetWindow.endsAt
        ? Math.max(0, Math.ceil((sideBetWindow.endsAt - clockNow) / 1000))
        : 0;
    const bSideBetWindowLive = sideBetWindow.visible && sideBetSecondsRemaining > 0;
    const bSideBetWindowOpen = bSideBetWindowLive && !bDontShowSideBetInfo;
    const turnTimerRemainingMs = turnTimer.active && turnTimer.endsAt
        ? Math.max(0, turnTimer.endsAt - clockNow)
        : 0;
    const turnTimerProgress = turnTimer.active && turnTimer.totalMs > 0
        ? Math.max(0, Math.min(1, turnTimerRemainingMs / turnTimer.totalMs))
        : 0;
    const consoleAvatarStyle = {
        '--turn-progress': `${turnTimerProgress * 100}%`,
    };

    const addSideBet = (id) => {
        if (isPaused || !bSideBetWindowOpen) return;
        setSideBets((currentBets) => {
            const nextAmount = Math.max(0, Math.min(SIDE_BET_MAX, (Number(currentBets[id]) || 0) + sideBetUnitAmount));
            return {
                ...currentBets,
                [id]: nextAmount,
            };
        });
    };

    const clearSideBet = (id) => {
        if (isPaused || !bSideBetWindowOpen) return;
        setSideBets((currentBets) => ({
            ...currentBets,
            [id]: 0,
        }));
    };

    const clearAllSideBets = () => {
        if (isPaused || !bSideBetWindowOpen) return;
        setSideBets(createInitialSideBets());
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
        if (typeof window === 'undefined') return;
        window.localStorage?.setItem(SIDE_BET_INFO_DISMISSED_STORAGE_KEY, bDontShowSideBetInfo ? '1' : '0');
    }, [bDontShowSideBetInfo]);

    useEffect(() => {
        if (!bDontShowSideBetInfo) return;
        setShowSideBetInfo(false);
        setSideBets(createInitialSideBets());
        setSideBetWindow((currentWindow) => ({
            ...currentWindow,
            dismissed: true,
        }));
    }, [bDontShowSideBetInfo]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        window.dispatchEvent(new CustomEvent(GAME_BROWSER_EVENTS.SIDE_BETS_CHANGE, {
            detail: {
                bets: sideBets,
                total: totalSideBets,
            },
        }));
    }, [sideBets, totalSideBets]);

    useEffect(() => {
        const handleServerSideBets = (event) => {
            const nextBets = event?.detail?.bets;
            if (!nextBets || typeof nextBets !== 'object') return;
            setSideBets({
                ...createInitialSideBets(),
                ...nextBets,
            });
            if (Number.isFinite(Number(event?.detail?.nChips))) queryClient.invalidateQueries('profileData');
            const payout = normalizeSideBetPayouts(event?.detail);
            if (payout.total > 0) setSideBetPayout(payout);
        };
        const handleConsoleCards = (event) => {
            setConsoleCards({
                hand: Array.isArray(event?.detail?.hand) ? event.detail.hand : [],
                community: Array.isArray(event?.detail?.community) ? event.detail.community : [],
                sideBetCommunity: Array.isArray(event?.detail?.sideBetCommunity) ? event.detail.sideBetCommunity : [],
                sideBetLive: event?.detail?.sideBetLive !== false,
                score: Number(event?.detail?.score) || 0,
                isFolded: Boolean(event?.detail?.isFolded),
            });
        };

        window.addEventListener(GAME_BROWSER_EVENTS.SIDE_BETS_SERVER_STATE, handleServerSideBets);
        window.addEventListener(GAME_BROWSER_EVENTS.CONSOLE_CARDS, handleConsoleCards);
        return () => {
            window.removeEventListener(GAME_BROWSER_EVENTS.SIDE_BETS_SERVER_STATE, handleServerSideBets);
            window.removeEventListener(GAME_BROWSER_EVENTS.CONSOLE_CARDS, handleConsoleCards);
        };
    }, [queryClient]);

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
        const handleSideBetPayout = (event) => {
            const payout = normalizeSideBetPayouts(event?.detail);
            if (payout.total > 0) setSideBetPayout(payout);
        };

        window.addEventListener(GAME_BROWSER_EVENTS.SIDE_BET_PAYOUT, handleSideBetPayout);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.SIDE_BET_PAYOUT, handleSideBetPayout);
    }, []);

    useEffect(() => {
        const handleSideBetWindow = (event) => {
            const bVisible = Boolean(event?.detail?.visible);
            const nSeconds = Math.max(0, Number(event?.detail?.seconds) || 0);
            if (bVisible) {
                setSideBets(createInitialSideBets());
                setSideBetPayout({ payouts: {}, total: 0, message: '', expiresAt: 0 });
                if (!bDontShowSideBetInfo && !bAutoSideBetInfoShownRef.current) {
                    setShowSideBetInfo(true);
                    bAutoSideBetInfoShownRef.current = true;
                }
            }
            setSideBetWindow({
                visible: bVisible,
                dismissed: false,
                endsAt: bVisible && nSeconds ? Date.now() + (nSeconds * 1000) : 0,
            });
        };

        window.addEventListener(GAME_BROWSER_EVENTS.SIDE_BET_WINDOW, handleSideBetWindow);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.SIDE_BET_WINDOW, handleSideBetWindow);
    }, [bDontShowSideBetInfo]);

    useEffect(() => {
        const handleSideBetConfig = (event) => {
            const nBigBlind = Number(event?.detail?.bigBlind);
            if (Number.isFinite(nBigBlind) && nBigBlind > 0) {
                setSideBetUnitAmount(nBigBlind);
                setBlindAmounts({
                    smallBlind: nBigBlind / 2,
                    bigBlind: nBigBlind,
                });
            }
        };

        window.addEventListener(GAME_BROWSER_EVENTS.SIDE_BET_CONFIG, handleSideBetConfig);
        return () => window.removeEventListener(GAME_BROWSER_EVENTS.SIDE_BET_CONFIG, handleSideBetConfig);
    }, []);

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
        if (!sideBetWindow.visible || !sideBetWindow.endsAt) return undefined;
        if (clockNow < sideBetWindow.endsAt) return undefined;
        setSideBetWindow((currentWindow) => ({
            ...currentWindow,
            visible: false,
            dismissed: false,
            endsAt: 0,
        }));
        return undefined;
    }, [clockNow, sideBetWindow.endsAt, sideBetWindow.visible]);

    useEffect(() => {
        if (!sideBetPayout.expiresAt) return undefined;
        if (clockNow < sideBetPayout.expiresAt) return undefined;
        setSideBetPayout({ payouts: {}, total: 0, message: '', expiresAt: 0 });
        return undefined;
    }, [clockNow, sideBetPayout.expiresAt]);

    useEffect(() => {
        const bNeedsClock = (bSideBetWindowLive && sideBetWindow.endsAt > clockNow)
            || (turnTimer.active && turnTimer.endsAt > clockNow)
            || (sideBetPayout.expiresAt > clockNow);
        if (!bNeedsClock) return undefined;
        const timer = window.setInterval(() => setClockNow(Date.now()), 250);

        return () => window.clearInterval(timer);
    }, [bSideBetWindowLive, clockNow, sideBetPayout.expiresAt, sideBetWindow.endsAt, turnTimer.active, turnTimer.endsAt]);

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
    const hasMessage = Boolean(overlayState.message);
    const tableBankrollAmount = Number.isFinite(Number(overlayState.tableBankroll))
        ? formatWholeCurrency(overlayState.tableBankroll)
        : '--';
    const nLiveTableBankroll = Number(overlayState.tableBankroll);
    const nProfileBankroll = Number(profileData?.nChips);
    const nConsoleBankroll = getPreferredBankrollValue(nProfileBankroll, nLiveTableBankroll);
    const bankrollAmount = Number.isFinite(Number(nConsoleBankroll)) ? formatWholeCurrency(nConsoleBankroll) : '--';
    const nBigBlind = Number(overlayState.bigBlind || blindAmounts.bigBlind);
    const nSmallBlind = Number(overlayState.smallBlind || blindAmounts.smallBlind);
    const sBlindLabel = Number.isFinite(nBigBlind) && nBigBlind > 0
        ? `${formatBlindAmount(Number.isFinite(nSmallBlind) && nSmallBlind > 0 ? nSmallBlind : nBigBlind / 2)}/${formatBlindAmount(nBigBlind)}`
        : '';
    const sConsoleName = profileData?.sUserName || 'Player';
    const sConsoleAvatar = getAvatarImageSrc(profileData?.sAvatar, sConsoleName) || getAvatarImageSrc('', sConsoleName);
    const isVisible = Boolean(overlayState.visible);
    const bHasHoleCards = consoleCards.hand.length > 0;
    const bKeepConsoleVisible = isVisible || bSideBetWindowOpen || sideBetPayout.total > 0 || bHasHoleCards;
    const sideBetsPanel = (
        <div
            className={`game-action-overlay__console-side-bets game-action-overlay__console-side-bets--top-menu${bSideBetWindowOpen ? ' is-open' : ''}`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type='button'
                className='game-action-overlay__side-bet-info game-action-overlay__side-bet-info--console'
                onPointerDown={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setShowSideBetInfo(true);
                }}
                aria-label='Side bet payout information'
            >
                i
            </button>
            <SideBetsModule
                bets={sideBets}
                disabled={isPaused || !bSideBetWindowOpen}
                showHeading={bSideBetWindowOpen}
                showAddButtons={bSideBetWindowOpen}
                statuses={bSideBetWindowOpen ? {} : sideBetStatuses}
                unitAmount={sideBetUnitAmount}
                onAdd={addSideBet}
                onClear={clearSideBet}
            />
            {sideBetPayout.total > 0 ? (
                <div className='game-action-overlay__side-bet-payout game-action-overlay__side-bet-payout--console' aria-live='polite'>
                    <span>{sideBetPayout.message || 'Side Bet Paid'}</span>
                    <strong>+{_.formatCurrencyWithComa(sideBetPayout.total)}</strong>
                </div>
            ) : null}
            {bSideBetWindowOpen ? (
                <div className='game-action-overlay__console-side-bets-footer'>
                    <span>{sideBetSecondsRemaining}s</span>
                    <button
                        type='button'
                        className='game-action-overlay__side-bet-clear'
                        disabled={isPaused || !totalSideBets}
                        onPointerDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                        }}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            clearAllSideBets();
                        }}
                    >
                        Clear
                    </button>
                    <label
                        className='game-action-overlay__side-bet-popup-dismiss'
                        onPointerDown={(event) => event.stopPropagation()}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <input
                            type='checkbox'
                            checked={bDontShowSideBetInfo}
                            onChange={(event) => setDontShowSideBetInfo(event.target.checked)}
                        />
                        <span>Don&apos;t show again</span>
                    </label>
                </div>
            ) : null}
        </div>
    );

    return (
        <>
            <div className='game-stage-utility' aria-label='Game utility controls'>
                {sBlindLabel ? (
                    <div className='game-stage-utility__blind' aria-label={`Table blinds ${sBlindLabel}`}>
                        <span>Blinds</span>
                        <strong>{sBlindLabel}</strong>
                    </div>
                ) : null}
                {sideBetsPanel}
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
                    {hasButtons ? (
                        <div className={`game-action-overlay__rows game-action-overlay__rows--interactive${DEBUG_CONSOLE_LAYOUT ? ' is-debug-layout' : ''}`}>
                            {rows.map((row, rowIndex) => {
                                const rowButtons = Array.isArray(row?.buttons) ? row.buttons.filter(Boolean) : [];
                                if (!rowButtons.length) return null;

                                return (
                                    <div
                                        key={row.id || `row-${rowIndex}`}
                                        className={`game-action-overlay__row auth-intro-actions ${row.className || ''}`.trim()}
                                    >
                                        {rowButtons.map((button) => {
                                            const variantClass = BUTTON_CLASS_BY_VARIANT[button.variant] || BUTTON_CLASS_BY_VARIANT.secondary;
                                            const widthClass = button.widthClass || '';

                                            return (
                                                <Button
                                                    key={button.key}
                                                    type='button'
                                                    className={`${variantClass} ${widthClass}`.trim()}
                                                    data-game-action-key={button.key}
                                                    disabled={isPaused || button.disabled}
                                                    onClick={() => emitGameActionOverlayCommand(button.key, {
                                                        amount: button.amount,
                                                    })}
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
                            {/*
                                <span className='game-action-overlay__side-bet-callout'>
                                    Place a bet now for the next hand
                                    <button
                                        type='button'
                                        className='game-action-overlay__side-bet-callout-close'
                                        aria-label='Hide side bet reminder'
                                    >
                                        ×
                                    </button>
                                </span>
                            */}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <SideBetInfoDialog
            visible={bShowSideBetInfo}
            onClose={() => setShowSideBetInfo(false)}
            dontShowAgain={bDontShowSideBetInfo}
            onDontShowAgainChange={setDontShowSideBetInfo}
        />

        </>
    );
}

export default GameActionOverlay;
