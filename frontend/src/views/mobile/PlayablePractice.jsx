import React, { useState } from 'react';
import { Cards } from './Cards';
import { newHand, practiceAction, totalFor } from './practiceGame.mjs';
import { getBuiltInAvatar } from 'shared/constants/builtInAvatars';
import table from '../../assets/images/gameplay/classic-table-v2.webp';
import backdrop from '../../assets/images/tutorial/backgrounds/casino-salon.png';
import host from '../../assets/images/onboarding/tutorial-host.webp';

export default function PlayablePractice() {
    const [game, setGame] = useState(() => newHand());
    const you = game.players[0];
    const ended = game.phase === 'result';
    const due = game.bet - you.paid;
    const act = action => setGame(previous => practiceAction(previous, action));
    const title = ended ? 'Hand complete' : game.phase === 'bet' ? 'Your betting turn' : you.locked !== null ? 'Your total is locked' : 'Hit or stand?';
    return <section className="ucd-practice ucd-playable" aria-label="Playable practice table">
        <span className="ucd-eyebrow">YOU + 3 PRACTICE PLAYERS</span>
        <h1>Take your seat</h1><p>Play a full hand at your pace. Practice chips only.</p>
        <div className="ucd-practice-room" style={{ '--practice-backdrop': `url(${backdrop})` }}>
            <div className="ucd-practice-hud"><span>{['Opening hand', 'Action', 'Stage', 'Show', 'Caboose'][game.board.length]}<strong>Blinds 5 / 10</strong></span><span>Your practice chips<strong>{you.chips.toLocaleString()}</strong></span></div>
            <div className="ucd-replica-seats" aria-label="Practice players">{game.players.slice(1).map((player, i) => <div className={`ucd-replica-seat ucd-replica-seat-${i}`} key={player.name}>
                <img src={getBuiltInAvatar('', i).sPath} alt="" /><strong>{player.name}</strong><span>{['Dealer', 'Small blind', 'Big blind'][i]} · {player.chips.toLocaleString()}</span><span>{player.status}</span>
                {ended ? <><Cards cards={player.cards} label={`${player.name}'s private card`} /><strong>{player.folded ? 'Folded' : totalFor(player, game.board) > 21 ? 'Bust' : `Total ${totalFor(player, game.board)}`}</strong></> : <span className="ucd-card-back" aria-label="Private card face down">21</span>}
            </div>)}</div>
            <div className="ucd-replica-table"><img className="ucd-replica-art" src={table} alt="Original 21 Hold’em game table" /><div className="ucd-replica-board"><div className="ucd-pot"><span>POT</span><strong>{game.pot} <small>chips</small></strong></div><h2>Community cards</h2><Cards cards={game.board} label="Practice community cards" /></div></div>
            <div className="ucd-hand"><div className="ucd-practice-player"><img src={getBuiltInAvatar('', 3).sPath} alt="" /><strong>YOU <span>{you.folded ? 'Folded' : totalFor(you, game.board) > 21 ? 'Bust' : you.locked !== null ? 'Standing · total locked' : 'Your private card'}</span></strong><div className="ucd-total"><span>Your total</span><strong>{totalFor(you, game.board)}</strong></div></div><Cards cards={you.cards} label="Your practice private card" /></div>
        </div>
        <div className="ucd-lesson ucd-practice-guide" role="status" aria-live="polite" aria-atomic="true"><img src={host} alt="" /><div><h2>{title}</h2><p>{ended ? game.result : game.phase === 'bet' ? due ? `Match ${due} chips to stay in, raise the bet, or fold.` : 'No bet to match. Check or open the betting.' : you.locked !== null ? 'Your total stays fixed. You may still need to call or fold while others play.' : 'Hit takes the next shared card. Stand keeps your current total for the rest of this hand.'}</p></div></div>
        <div className="ucd-actions" aria-label="Practice actions">
            {ended ? <button className="ucd-primary ucd-wide" onClick={() => setGame(newHand())}>Deal another hand</button> : game.phase === 'bet' ? <><button className="ucd-primary" onClick={() => act('call')}>{due ? `Call ${due} chips` : 'Check'}</button>{you.locked === null && <button onClick={() => act('raise')}>{game.bet ? `Raise to ${game.bet + 10}` : 'Bet 10 chips'}</button>}<button className="ucd-danger" onClick={() => act('fold')}>Fold</button></> : you.locked !== null ? <button className="ucd-primary" onClick={() => act('continue')}>Continue hand</button> : <><button className="ucd-primary" onClick={() => act('hit')}>{game.board.length === 4 ? 'Showdown' : 'Hit · next card'}</button><button onClick={() => act('stand')}>Stand · lock {totalFor(you, game.board)}</button></>}
        </div>
        <details className="ucd-section"><summary>What just happened?</summary><ul>{game.log.map((line, i) => <li key={i}>{line}</li>)}</ul></details>
        <p className="ucd-muted">Practice players act automatically. Each new hand starts with 1,000 practice chips per player. This table teaches betting, Hit and Stand; Double Down and all-in play are available at live tables.</p>
    </section>;
}
