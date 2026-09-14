import React, { useState } from 'react';
import { Cards } from './Cards';
import { getBuiltInAvatar } from 'shared/constants/builtInAvatars';
import backdrop from '../../assets/images/tutorial/backgrounds/casino-salon.png';
import host from '../../assets/images/onboarding/tutorial-host.webp';

const opponents = ['Alex', 'Morgan', 'Sam'];

const lessons = [
    { title: 'Your private card', text: 'Your Jack is worth 10. Call to match the bet and stay in this example hand.', action: 'Call 10 chips', board: [], total: 10 },
    { title: 'The first shared card', text: 'The shared 4 brings your total to 14. Continue to see the next community card.', action: 'Continue · take the next card', board: [4], total: 14 },
    { title: 'You have 21', text: 'The shared 7 brings your total to 21. Stand to lock this total. Later shared cards will no longer count in your hand.', action: 'Stand · lock 21', board: [4, 7], total: 21 },
    { title: 'Your total is locked', text: 'You finish on 21. In a live hand, you may still need to call or fold after standing. This guided example ends here.', action: 'Try again', board: [4, 7], total: 21 },
];
export default function Practice() {
    const [step, setStep] = useState(0);
    const lesson = lessons[step];
    return <section className="ucd-practice" aria-label="Guided practice hand">
        <span className="ucd-eyebrow">GUIDED PRACTICE · NO CHIPS SPENT</span>
        <h1>A hand at your pace</h1><p>No timer. Take as long as you like.</p>
        <div className="ucd-practice-room" style={{ '--practice-backdrop': `url(${backdrop})` }}>
            <div className="ucd-practice-hud"><span>Blinds <strong>5 / 10</strong></span><span>Practice chips<strong>{step ? '990' : '1,000'}</strong></span></div>
            <ul className="ucd-practice-seats" aria-label="Example opponents">{opponents.map((name, index) => <li key={name}><img src={getBuiltInAvatar('', index).sPath} alt="" /><strong>{name}</strong><span>{['Dealer', 'Small blind', 'Big blind'][index]}</span></li>)}</ul>
            <div className="ucd-felt ucd-practice-table">
                <span className="ucd-practice-wordmark" aria-hidden="true">21 HOLD’EM</span>
                <div className="ucd-pot"><span>POT</span><strong>{step ? 25 : 15} <small>practice chips</small></strong></div>
                <h2>Community cards</h2><Cards cards={lesson.board.map((nLabel, i) => ({ nLabel, eSuit: i ? 'h' : 'c' }))} label="Example community cards" />
            </div>
            <div className="ucd-hand"><div className="ucd-practice-player"><img src={getBuiltInAvatar('', 3).sPath} alt="" /><strong>YOU <span>{step === 3 ? 'Standing · total locked' : 'Your hand'}</span></strong></div><div className="ucd-between"><h2>Your private card</h2><div className="ucd-total"><span>Your total</span><strong>{lesson.total}</strong></div></div><Cards cards={[{ nLabel: 11, eSuit: 's' }]} label="Example private card" /></div>
        </div>
        <div className="ucd-lesson ucd-practice-guide" aria-live="polite" aria-atomic="true"><img src={host} alt="" /><div><span>Step {step + 1} of 4</span><h2>{lesson.title}</h2><p>{lesson.text}</p></div></div>
        <button className="ucd-primary ucd-wide" onClick={() => setStep((step + 1) % lessons.length)}>{lesson.action}</button>
    </section>;
}
