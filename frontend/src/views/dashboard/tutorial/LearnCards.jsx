import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FirstHandTutorial from './FirstHandTutorial';
import './learnCards.scss';

const lessons = [
    { title: 'Get close. Stay under.', category: 'The goal', key: 'goal' },
    { title: 'Your card. A shared table.', category: 'Building your hand', key: 'shared' },
    { title: 'An ace has two sides.', category: 'Card values', key: 'values' },
    { title: 'Stay in, or step away.', category: 'Betting basics', key: 'betting' },
    { title: 'Take a card. Or lock it.', category: 'Hit or Stand', key: 'decision' },
    { title: 'One extra private card.', category: 'Double Down', key: 'double' },
    { title: 'Time to show your hand.', category: 'Who wins?', key: 'showdown' },
    { title: 'You make the call.', category: 'Quick check', key: 'quiz' },
    { title: 'Your seat is waiting.', category: 'Put it together', key: 'ready' },
];

function PlayingCard({ rank, label, red = false, muted = false }) {
    return <span className={`learn-playing-card${red ? ' is-red' : ''}${muted ? ' is-muted' : ''}`} role='img' aria-label={label || `${rank} of ${red ? 'diamonds' : 'spades'}`}>
        <b>{rank}</b>
        <svg viewBox='0 0 24 24' aria-hidden='true'><path fill='currentColor' d={red ? 'M12 2 21 12 12 22 3 12Z' : 'M12 2 3 11C-2 18 5 23 10 17L8 23H16L14 17C19 23 26 18 21 11Z'} /></svg>
        <b aria-hidden='true'>{rank}</b>
    </span>;
}

function Equation({ children, total, label }) {
    return <div className='learn-equation' role='img' aria-label={label}>
        <div className='learn-equation__cards'>{children}</div>
        <span className='learn-equation__result'>{total}</span>
    </div>;
}

export default function LearnCards({ active, onPlay }) {
    const tutorialId = useId();
    const track = useRef(null);
    const indexRef = useRef(0);
    const tutorialToggle = useRef(null);
    const tutorialRegion = useRef(null);
    const [index, setIndex] = useState(0);
    const [extraCard, setExtraCard] = useState(false);
    const [stand, setStand] = useState(false);
    const [answer, setAnswer] = useState(null);
    const [tutorialOpen, setTutorialOpen] = useState(false);
    indexRef.current = index;

    useEffect(() => {
        if (!active) { setTutorialOpen(false); return undefined; }
        const node = track.current;
        const align = () => {
            if (node?.clientWidth) node.scrollTo({ left: node.children[indexRef.current]?.offsetLeft || 0, behavior: 'instant' });
        };
        const frame = requestAnimationFrame(align);
        const observer = new ResizeObserver(align);
        if (node) observer.observe(node);
        return () => { cancelAnimationFrame(frame); observer.disconnect(); };
    }, [active]);

    const move = (next, keyboard = false) => {
        const node = track.current;
        const target = Math.max(0, Math.min(lessons.length - 1, next));
        if (!node?.children[target]) return;
        node.scrollTo({ left: node.children[target].offsetLeft, behavior: keyboard || window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
    };

    const onScroll = () => {
        const node = track.current;
        if (!active || !node?.clientWidth) return;
        const next = Array.from(node.children).reduce((closest, child, i, children) => (
            Math.abs(child.offsetLeft - node.scrollLeft) < Math.abs(children[closest].offsetLeft - node.scrollLeft) ? i : closest
        ), 0);
        if (next !== indexRef.current) {
            const focusedSlide = document.activeElement?.closest('.learn-card');
            if (focusedSlide && focusedSlide !== node.children[next]) node.focus({ preventScroll: true });
            setIndex(next);
        }
    };

    const watchHand = () => {
        setTutorialOpen(true);
        requestAnimationFrame(() => {
            tutorialToggle.current?.focus({ preventScroll: true });
            tutorialRegion.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
        });
    };

    const illustration = (key) => {
        switch (key) {
        case 'goal': return <div className='learn-scoreboard' role='img' aria-label='At showdown: 19 beats 18. A total of 23 is bust.'>
            <div><span>Opponent</span><strong>18</strong><small>Still valid</small></div>
            <div className='is-winner'><span>You</span><strong>19</strong><small>Best total</small></div>
            <div className='is-bust'><span>Opponent</span><strong>23</strong><small>Bust</small></div>
        </div>;
        case 'shared': return <div className='learn-shared' role='img' aria-label='Your private Jack is worth 10. Add the shared 4 for a total of 14.'>
            <div><PlayingCard rank='J' /><small>Just yours</small></div><b>+</b><div><PlayingCard rank='4' red /><small>Shared</small></div><b>=</b><strong>14</strong>
        </div>;
        case 'values': return <Equation total={extraCard ? '15' : '20'} label={extraCard ? 'Ace plus 9 plus 5 equals 15. The ace now counts as 1.' : 'Ace plus 9 equals 20. The ace counts as 11.'}>
            <PlayingCard rank='A' /><b>+</b><PlayingCard rank='9' red />{extraCard && <><b>+</b><PlayingCard rank='5' /></>}
        </Equation>;
        case 'betting': return <div className='learn-chip-example' role='img' aria-label='The bet is 20 chips. You have paid 10. Call adds the remaining 10.'>
            <div><span className='learn-chip'>20</span><small>Current bet</small></div><b>&minus;</b><div><span className='learn-chip is-paid'>10</span><small>Already paid</small></div><b>=</b><div><span className='learn-chip is-call'>10</span><small>To call</small></div>
        </div>;
        case 'decision': return <Equation total={stand ? '14 locked' : '21'} label={stand ? 'Stand at 14. The later shared 7 does not count for you.' : 'Hit: Jack plus 4 plus the next shared 7 equals 21 in this example.'}>
            <PlayingCard rank='J' /><b>+</b><PlayingCard rank='4' red /><b>+</b><PlayingCard rank='7' muted={stand} />
        </Equation>;
        case 'double': return <Equation total='19 locked' label='Example: Jack plus the shared 4 plus a new private 5 gives a locked total of 19.'>
            <PlayingCard rank='J' /><b>+</b><PlayingCard rank='4' red /><b>+</b><PlayingCard rank='5' label='New private 5' />
        </Equation>;
        case 'showdown': return <div className='learn-split' role='img' aria-label='Two players tied on 20 share the winning pot.'>
            <div><strong>20</strong><span>Your hand</span></div><span className='learn-split__pot'>Split<br />the pot</span><div><strong>20</strong><span>Their hand</span></div>
        </div>;
        case 'quiz': return <Equation total='?' label='A King, an 8 and a 5. What is the total?'>
            <PlayingCard rank='K' /><b>+</b><PlayingCard rank='8' red /><b>+</b><PlayingCard rank='5' />
        </Equation>;
        default: return <div className='learn-ready-art' role='img' aria-label='Three steps: choose a table, read your cards, take your turn.'>
            <span><b>1</b>Choose a table</span><span><b>2</b>Read your cards</span><span><b>3</b>Take your turn</span>
        </div>;
        }
    };

    const content = (key) => {
        switch (key) {
        case 'goal': return <><p>Beat the other players with the highest total of <strong>21 or less</strong>. Go over 21 and your hand is bust.</p><div className='learn-takeaway'>You play against other players, not a dealer hand.</div></>;
        case 'shared': return <><p>Blinds start the pot. Everyone gets <strong>one private card</strong>. Shared community cards add to the totals of players still taking cards.</p><div className='learn-rounds' aria-label='Community-card stages'><span>Action</span><span>Stage</span><span>Show</span><span>Caboose</span></div></>;
        case 'values': return <><p>Numbers count as shown. <strong>J, Q and K are 10.</strong> An ace is 1 or 11, whichever gives the best valid total.</p><button type='button' className='learn-action' aria-pressed={extraCard} onClick={() => setExtraCard(!extraCard)}>{extraCard ? 'Remove the 5' : 'Add a 5'}</button><div className='learn-takeaway' role='status'>{extraCard ? 'The ace changes to 1. Your total is 15, not 25.' : 'Here the ace is 11. Add a card to see it change.'}</div></>;
        case 'betting': return <><dl className='learn-actions-list'><div><dt>Check</dt><dd>Pass when no bet is open.</dd></div><div><dt>Call</dt><dd>Match the bet to stay in.</dd></div><div><dt>Raise</dt><dd>Increase the bet, when allowed.</dd></div><div><dt>Fold</dt><dd>Leave the hand and the pot.</dd></div></dl><div className='learn-takeaway'>Only available actions appear on your turn.</div></>;
        case 'decision': return <><div className='learn-choice' role='group' aria-label='Compare Hit and Stand'><button type='button' aria-pressed={!stand} onClick={() => setStand(false)}>Hit example</button><button type='button' aria-pressed={stand} onClick={() => setStand(true)}>Stand example</button></div><p role='status'>{stand ? 'Stand keeps your 14. Later community cards cannot improve it or bust it.' : 'Hit continues to the next community card. A shared 7 makes 21 in this example.'}</p><div className='learn-takeaway'>After standing, later bets can still require a call or fold.</div></>;
        case 'double': return <><p>In <strong>round 2, after the first shared card</strong>, Double Down costs twice the current minimum bet. Take one extra private card, then lock your total.</p><div className='learn-takeaway'>You cannot raise afterwards. Later bets may still require a call or fold.</div></>;
        case 'showdown': return <><p>At showdown, active hands reveal. The <strong>highest valid total wins</strong>; tied winners share the pot. Folded and busted hands cannot win it.</p><div className='learn-takeaway'>The eye icon marks your private card for reveal this hand. Active hands reveal at showdown anyway.</div></>;
        case 'quiz': return <><p>A King is 10. Add the 8 and the 5. <strong>What happens to this hand?</strong></p><div className='learn-quiz' role='group' aria-label='Choose the total'>{['21 — a perfect total', '23 — bust', '13 — still in'].map((label, i) => <button type='button' key={label} aria-pressed={answer === i} onClick={() => setAnswer(i)}>{label}</button>)}</div><div className='learn-feedback' role='status'>{answer === null ? 'Tap an answer. No chips at risk.' : answer === 1 ? 'Exactly! 10 + 8 + 5 = 23. Over 21 is bust.' : 'Try again: the King is 10, so add 10 + 8 + 5.'}</div></>;
        default: return <><p>Check the buy-in on your table, then take a seat. Read your total and the available actions before each decision.</p><button type='button' className='learn-action is-primary' onClick={onPlay}>Choose a table</button><button type='button' className='learn-action' onClick={watchHand}>Watch the guided hand</button><Link className='learn-rules-link' to='/settings/rules'>Read the full rules &rarr;</Link></>;
        }
    };

    return <section className='learn-deck' aria-label="Learn 21 Hold'em">
        <p className='learn-deck__intro'>One idea at a time. Swipe to explore, or use Back and Next.</p>
        <div className='learn-deck__track' ref={track} tabIndex={0} role='region' aria-roledescription='carousel' aria-label='How to play cards' onScroll={onScroll} onKeyDown={event => {
            if (event.target !== event.currentTarget || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            move(event.key === 'Home' ? 0 : event.key === 'End' ? lessons.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1), true);
        }}>
            {lessons.map((lesson, i) => <article className='learn-card' key={lesson.key} role='group' aria-roledescription='slide' aria-label={`${i + 1} of ${lessons.length}: ${lesson.title}`} aria-hidden={index !== i} inert={index !== i ? '' : undefined}>
                <header className='learn-card__header'><span>{lesson.category}</span><b aria-hidden='true'>{String(i + 1).padStart(2, '0')}</b><h3>{lesson.title}</h3></header>
                <div className='learn-card__illustration'>{illustration(lesson.key)}</div>
                <div className='learn-card__copy'>{content(lesson.key)}</div>
            </article>)}
        </div>
        <div className='learn-deck__navigation'>
            <div className='learn-deck__progress' aria-hidden='true'>{lessons.map((lesson, i) => <i key={lesson.key} className={i === index ? 'is-current' : i < index ? 'is-read' : ''} />)}</div>
            <div className='learn-deck__transport'><button type='button' onClick={() => move(index - 1)} disabled={index === 0} aria-label='Previous information card'>&larr; Back</button><span role='status' aria-live='polite' aria-atomic='true'>{index + 1} / {lessons.length}<span className='visually-hidden'>: {lessons[index].title}</span></span><button type='button' onClick={() => move(index + 1)} disabled={index === lessons.length - 1} aria-label='Next information card'>Next &rarr;</button></div>
        </div>
        <div className='learn-guided' ref={tutorialRegion}>
            <button type='button' className='learn-guided__toggle' ref={tutorialToggle} aria-expanded={tutorialOpen} aria-controls={tutorialId} onClick={() => setTutorialOpen(!tutorialOpen)}><span><strong>See a hand in action</strong><small>A guided table, with no chips at risk.</small></span><span aria-hidden='true'>{tutorialOpen ? '−' : '+'}</span></button>
            <div id={tutorialId} hidden={!tutorialOpen}>{tutorialOpen && <FirstHandTutorial active={active} onPlay={onPlay} />}</div>
        </div>
    </section>;
}
