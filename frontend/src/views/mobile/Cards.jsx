import React from 'react';
export function Card({ card }) {
    const suits = { h: ['♥', 'hearts'], d: ['♦', 'diamonds'], c: ['♣', 'clubs'], s: ['♠', 'spades'] };
    const [symbol, name] = suits[String(card.eSuit || 's').toLowerCase()[0]] || suits.s;
    const rank = ({ 1: 'A', 11: 'J', 12: 'Q', 13: 'K' })[card.nLabel] || card.nLabel;
    return <span className={`ucd-card ucd-card--${name}`} role="img" aria-label={`${rank} of ${name}`}><b aria-hidden="true">{rank}</b><span aria-hidden="true">{symbol}</span></span>;
}
export function Cards({ cards = [], label }) {
    return <div className="ucd-cards" role="group" aria-label={label}>{cards.length ? cards.map((card, i) => <Card card={card} key={card._id || i} />) : <span className="ucd-card-empty">Waiting for cards</span>}</div>;
}
