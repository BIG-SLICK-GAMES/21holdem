import React, { useEffect, useRef, useState } from 'react';
import { Cards } from './Cards';
import { emitGameActionOverlayCommand, GAME_ACTION_OVERLAY_STATE_EVENT } from '../../scripts/gameActionOverlayBridge';
import { GAME_BROWSER_EVENTS as E } from '../../scripts/gameEvents';
import { useNavigate } from 'react-router-dom';

export function MobileDialog({ dialog, onClose }) {
    const ref = useRef(null);
    useEffect(() => {
        const previous = document.activeElement;
        ref.current?.showModal();
        return () => { previous?.focus?.(); };
    }, []);
    return <dialog ref={ref} className="ucd-dialog" onCancel={(e) => { e.preventDefault(); onClose(false); }} aria-labelledby="ucd-dialog-title">
        <h2 id="ucd-dialog-title">{dialog.title}</h2><p>{dialog.message}</p>
        <div className="ucd-stack"><button className="ucd-primary" onClick={() => onClose(true)}>{dialog.confirm ? (dialog.confirmText || 'Confirm') : 'Okay'}</button>
        {dialog.confirm && <button onClick={() => onClose(false)}>{dialog.cancelText || 'Cancel'}</button>}</div>
    </dialog>;
}

export default function MobileLiveTable() {
    const navigate = useNavigate();
    const [state, setState] = useState({ rows: [] });
    const [cards, setCards] = useState({ hand: [], community: [] });
    const [players, setPlayers] = useState([]);
    const [pot, setPot] = useState(0);
    const [notice, setNotice] = useState('Connecting to your table…');
    const [dialog, setDialog] = useState(null);
    const [seconds, setSeconds] = useState(null);
    const [muted, setMuted] = useState(true);
    const [pending, setPending] = useState(false);
    const [connected, setConnected] = useState(null);
    const deadline = useRef(0);
    const submitted = useRef(false);
    useEffect(() => {
        let soundInitialised = false;
        const handlers = {
            'bsg:mobile-connection': e => { setConnected(e.detail.connected); if (!e.detail.connected) { setState(s => ({ ...s, rows: [] })); submitted.current = false; setPending(false); } },
            [GAME_ACTION_OVERLAY_STATE_EVENT]: e => { setState(e.detail); submitted.current = false; setPending(false); },
            [E.CONSOLE_CARDS]: e => { setCards(e.detail); if (e.detail.hand?.length) setNotice(''); },
            'bsg:game-player-slots': e => setPlayers(e.detail.players || []),
            'bsg:mobile-pot': e => setPot(e.detail.amount),
            'bsg:mobile-prompt': e => setNotice(e.detail.message || ''),
            'bsg:mobile-dialog': e => setDialog(e.detail),
            [E.CONSOLE_TURN_TIMER]: e => { deadline.current = e.detail.active ? Date.now() + e.detail.remainingMs : 0; setSeconds(e.detail.active ? Math.ceil(e.detail.remainingMs / 1000) : null); },
            [E.CONSOLE_BUST]: () => setNotice('Bust. Your hand is over 21.'),
            [E.CONSOLE_WIN]: e => setNotice(`You won ${Number(e.detail.amount).toLocaleString()} chips!`),
            [E.SOUND_STATE]: () => { if (!soundInitialised) { soundInitialised = true; window.dispatchEvent(new CustomEvent(E.SOUND_SETTINGS_CHANGE, { detail: { soundOn: false, musicOn: false } })); } },
        };
        Object.entries(handlers).forEach(([name, fn]) => window.addEventListener(name, fn));
        const timer = setInterval(() => { if (deadline.current) setSeconds(Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000))); }, 500);
        return () => { clearInterval(timer); Object.entries(handlers).forEach(([name, fn]) => window.removeEventListener(name, fn)); };
    }, []);
    const buttons = (state.rows || []).flatMap(row => row.buttons || []);
    const active = players.find(p => p.bActiveTurn);
    function command(button) {
        if (submitted.current || button.disabled || connected === false) return;
        if (button.submitsAction) { submitted.current = true; setPending(true); }
        emitGameActionOverlayCommand(button.key);
    }
    return <section className="ucd-live" aria-label="Live 21 Hold’em table">
        {connected === false && <p role="alert">Connection lost. Reconnecting… Actions will return when the table reconnects.</p>}
        <div className="ucd-between"><button onClick={() => state.visible ? emitGameActionOverlayCommand('exitTable') : navigate('/mobile')}>{state.visible ? 'Leave table' : 'Back to lobby'}</button><button aria-pressed={!muted} onClick={() => { setMuted(!muted); window.dispatchEvent(new CustomEvent(E.SOUND_SETTINGS_CHANGE, { detail: { soundOn: muted, musicOn: false } })); }}>Sound {muted ? 'off' : 'on'}</button></div>
        <div className="ucd-pot"><span>Table pot</span><strong>{Number(pot).toLocaleString()} <small>chips</small></strong><span>Blinds {state.smallBlind || '—'} / {state.bigBlind || '—'}</span></div>
        <details className="ucd-opponents"><summary>Players at the table · {players.length}</summary><ul>{players.map(p => <li key={p.iUserId}><strong>{p.sUserName}{p.bLocalPlayer ? ' (you)' : ''}</strong><span>{p.bActiveTurn ? 'Taking a turn' : p.sActionLabel || p.eState} · {Number(p.nChips).toLocaleString()} chips{p.bShowScore ? ` · Total ${p.nCardScore}` : ''}</span></li>)}</ul></details>
        <div className="ucd-felt"><h2>{cards.locked ? 'Cards counted in your locked hand' : 'Community cards'}</h2><Cards cards={cards.community} label="Community cards counted in your hand" /></div>
        <div className="ucd-hand"><div className="ucd-between"><h2>Your hand</h2><div className="ucd-total"><span>{cards.locked ? 'Locked total' : 'Your total'}</span><strong>{cards.hand?.length ? cards.score : '—'}</strong></div></div><Cards cards={cards.hand} label="Your private cards" /><p>At table: {state.tableBankroll == null ? '—' : Number(state.tableBankroll).toLocaleString()} chips</p></div>
        <div className="ucd-turn" role="status">{notice || (buttons.length ? 'Your turn' : active ? `${active.sUserName} is taking a turn` : 'Waiting for the next hand')}{seconds !== null && <span aria-live="off"> · {seconds}s remaining</span>}</div>
        {state.message && <p className="ucd-turn">{state.message}</p>}
        <div className="ucd-actions" aria-label="Available game actions">{buttons.map(button => <button key={button.key} disabled={pending || button.disabled || seconds === 0 || connected === false} className={button.key === 'fold' ? 'ucd-danger' : button.variant === 'primary' ? 'ucd-primary' : ''} onClick={() => command(button)}>{button.label.replace(/\n/g, ' ')}</button>)}</div>
        {pending && <p role="status">Sending your action…</p>}
        {dialog && <MobileDialog key={dialog.id} dialog={dialog} onClose={accepted => { setDialog(null); dialog.respond?.(accepted); }} />}
    </section>;
}
