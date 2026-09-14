import React, { useState } from 'react';
import { Cards } from './Cards';

const lessons = [
    { title: 'Your private card', text: 'Your Jack is worth 10. Call to match the bet and stay in this example hand.', action: 'Call 10 chips', board: [], total: 10 },
    { title: 'The first shared card', text: 'The shared 4 brings your total to 14. Continue to see the next community card.', action: 'Continue · take the next card', board: [4], total: 14 },
    { title: 'You have 21', text: 'The shared 7 brings your total to 21. Stand to lock this total. Later shared cards will no longer count in your hand.', action: 'Stand · lock 21', board: [4, 7], total: 21 },
    { title: 'Your total is locked', text: 'You finish on 21. In a live hand, you may still need to call or fold after standing. This guided example ends here.', action: 'Try again', board: [4, 7], total: 21 },
];
export default function Practice() {
    const [step, setStep] = useState(0);
    const lesson = lessons[step];
    return <section aria-label="Guided practice hand">
        <span className="ucd-eyebrow">GUIDED PRACTICE · NO CHIPS SPENT</span>
        <h1>A hand at your pace</h1><p>No timer. Take as long as you like.</p>
        <div className="ucd-felt"><h2>Community cards</h2><Cards cards={lesson.board.map((nLabel, i) => ({ nLabel, eSuit: i ? 's' : 'h' }))} label="Example community cards" /></div>
        <div className="ucd-hand"><div className="ucd-between"><h2>Your private card</h2><div className="ucd-total"><span>Your total</span><strong>{lesson.total}</strong></div></div><Cards cards={[{ nLabel: 11, eSuit: 's' }]} label="Example private card" /></div>
        <div className="ucd-lesson" aria-live="polite"><span>Step {step + 1} of 4</span><h2>{lesson.title}</h2><p>{lesson.text}</p></div>
        <button className="ucd-primary ucd-wide" onClick={() => setStep((step + 1) % lessons.length)}>{lesson.action}</button>
    </section>;
}
