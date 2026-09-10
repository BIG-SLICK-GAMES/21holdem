import React, { useEffect, useRef } from 'react';
import { getBuiltInAvatar } from 'shared/constants/builtInAvatars';
import { GAME_BROWSER_EVENTS } from 'scripts/gameEvents';
import backdrop from '../../../assets/images/tutorial/backgrounds/casino-salon.png';
import dealSound from '../../../assets/sounds/card_sound.mp3';
import chipsSound from '../../../assets/sounds/chipsIn.mp3';
import clickSound from '../../../assets/sounds/click_sound.mp3';
import winSound from '../../../assets/sounds/winCoin_sound.mp3';
import { SCENES, currentReading, fraction, handSnapshot } from './firstHandStory';
import useTutorialPlayback from './useTutorialPlayback';
import useTutorialNarration from './useTutorialNarration';
import './firstHandTutorial.scss';

const portraits = [0, 1, 2, 3].map(index => getBuiltInAvatar('', index).sPath);
const names = ['Alex', 'Morgan', 'Sam'];
const soundFiles = { deal: dealSound, flip: dealSound, chips: chipsSound, selection: clickSound, twentyOne: null, win: winSound };

function Crown() {
  return <svg viewBox='0 0 64 44' aria-hidden='true'><path d='M5 8 18 22 32 3 46 22 59 8 52 37H12Z' fill='currentColor' /><path d='M13 42H51' stroke='currentColor' strokeWidth='4' /></svg>;
}

function Suit({ suit }) {
  const path = suit === '\u2665' ? 'M12 21 3 12C-4 4 7-2 12 5 17-2 28 4 21 12Z' : suit === '\u2663' ? 'M9 14C-3 23-3 7 7 9 0-3 24-3 17 9 27 7 27 23 15 14L17 23H7Z' : 'M12 1 3 10C-3 17 4 22 10 16L8 23H16L14 16C20 22 27 17 21 10Z';
  return <svg viewBox='0 0 24 24' aria-hidden='true'><path d={path} fill='currentColor' /></svg>;
}

function Card({ value = 'J', suit = '\u2660', face = true, progress = 1, small = false }) {
  return <span className={`first-hand__card${small ? ' first-hand__card--small' : ''}`} role='img' aria-label={face ? `${value} ${suit === '\u2660' ? 'of spades' : suit === '\u2665' ? 'of hearts' : 'of clubs'}` : 'Facedown private card'}>
    <span className='first-hand__card-flip' style={{ transform: `rotateY(${face ? 180 * progress : 0}deg)` }}>
      <span className='first-hand__card-back'><Crown /><b>21</b></span>
      <span className={`first-hand__card-face${suit === '\u2665' ? ' is-red' : ''}`}><Suit suit={suit} /><b>{value}</b><Suit suit={suit} /></span>
    </span>
  </span>;
}

export default function FirstHandTutorial({ active, onPlay }) {
  const { root, state, dispatch, reducedMotion, visible } = useTutorialPlayback(active);
  const { scene, generation, playing } = state;
  const elapsed = state.elapsed;
  const reading = currentReading(state);
  const voice = useTutorialNarration(reading, active && visible);
  const hand = handSnapshot(scene, elapsed);
  const soundAllowed = useRef(false);
  const interacted = useRef(false);
  const sounds = useRef(new Set());
  const lastCue = useRef('');
  const firstHand = SCENES[scene];
  const decision = Math.min(2, Math.floor(elapsed / 5000));
  const focusAction = scene === 2 ? Math.min(2, Math.floor(elapsed / 3000)) : -1;
  const animate = (start, duration) => reducedMotion ? 1 : fraction(elapsed, start, duration);

  useEffect(() => {
    const stop = () => { sounds.current.forEach(audio => audio.pause()); sounds.current.clear(); };
    const preference = event => { soundAllowed.current = event.detail?.soundOn === true; if (!soundAllowed.current) stop(); };
    window.addEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, preference);
    return () => { window.removeEventListener(GAME_BROWSER_EVENTS.SOUND_STATE, preference); stop(); };
  }, []);
  useEffect(() => {
    const cue = scene === 1 ? (elapsed < 1800 ? 'deal' : 'flip') : scene === 2 ? 'chips' : scene === 3 ? (hand.total === 21 ? 'twentyOne' : 'deal') : scene === 6 ? 'win' : 'selection';
    const key = `${generation}:${scene}:${cue}:${hand.board.length}`;
    if (!active || !visible || !playing || lastCue.current === key) return;
    lastCue.current = key;
    if (!soundAllowed.current || !interacted.current || !soundFiles[cue]) return;
    const audio = new Audio(soundFiles[cue]);
    audio.volume = 0.18;
    sounds.current.add(audio);
    audio.onended = () => sounds.current.delete(audio);
    audio.play().catch(() => sounds.current.delete(audio));
  }, [scene, elapsed, generation, hand.total, hand.board.length, active, visible, playing]);
  useEffect(() => {
    if (!active || !visible || !playing) { sounds.current.forEach(audio => audio.pause()); sounds.current.clear(); }
  }, [active, visible, playing]);

  const act = action => { interacted.current = true; dispatch({ ...action, reducedMotion }); };
  const keyDown = event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); act({ type: 'move', direction: event.key === 'ArrowRight' ? 1 : -1 });
    }
    if (event.key === ' ' && event.target === event.currentTarget) { event.preventDefault(); act({ type: 'toggle' }); }
  };

  return <section ref={root} className={`first-hand${reducedMotion ? ' first-hand--reduced' : ''}`} aria-label='Your first hand: animated tutorial' tabIndex={0} onKeyDown={keyDown}>
    <div className='first-hand__phone'>
      <header className='first-hand__header'><span><Crown />21 HOLD'EM</span><span>YOUR FIRST HAND</span></header>
      <div className='first-hand__chapter' aria-live='polite' aria-atomic='true'><span>{String(scene + 1).padStart(2, '0')} / 07</span><h2>{firstHand.title}</h2></div>
      <div className={`first-hand__stage first-hand__stage--${scene}${reading ? ` first-hand__focus--${reading.focus}` : ''}`} key={generation}>
        {reading && <div className='first-hand__reading-mask' aria-hidden='true' />}
        {visible && <img className='first-hand__backdrop' src={backdrop} alt='' loading='lazy' width='1024' height='1536' style={{ transform: `scale(1.06) translateY(${reducedMotion ? 0 : Math.sin(elapsed / 4500) * 1.2}%)` }} />}
        <div className='first-hand__table' style={{ opacity: scene === 0 ? animate(0, 1600) : 1, transform: `translateY(${scene === 0 ? 24 * (1 - animate(0, 1600)) : 0}px) scale(${scene === 3 ? 1.025 : 1})` }}><div className='first-hand__felt'><Crown /><span>21 HOLD'EM</span></div></div>
        {scene === 6 && <div className='first-hand__rim-light' style={{ opacity: reducedMotion ? 0 : Math.sin(Math.PI * animate(600, 2500)) }} />}
        <div className='first-hand__pot'><span>POT</span><strong>{hand.pot}</strong><small>chips</small></div>
        {names.map((name, index) => {
          const reveal = scene >= 6 || (scene === 5 && elapsed >= 1200 + index * 1700);
          const entered = scene === 0 ? animate(900 + index * 500, 700) : 1;
          return <div key={name} className={`first-hand__opponent first-hand__opponent--${index}${scene === 2 && focusAction === index ? ' is-turn' : ''}`} style={{ opacity: entered, transform: `translateY(${(1 - entered) * 15}px)` }}>
            <div className='first-hand__portrait'>{visible && <img src={portraits[index]} alt='' loading='lazy' width='64' height='64' />}<span className='first-hand__blind'>{['D', 'SB', 'BB'][index]}</span></div>
            <b>{name}</b>
            {reveal ? <span className='first-hand__opponent-hand'><Card small value={hand.opponents[index].card} suit={index === 1 ? '\u2665' : '\u2663'} /><strong>{hand.opponents[index].total}</strong></span> : <small>{scene >= 4 ? 'STAND' : 'IN THE HAND'}</small>}
          </div>;
        })}
        <div className='first-hand__board' aria-label='Community cards'>
          {hand.board.map((value, index) => <span key={value} style={{ opacity: scene === 3 ? animate(index === 0 ? 1600 : 5500, 400) : 1, transform: `translateY(${scene === 3 ? -25 * (1 - animate(index === 0 ? 1600 : 5500, 500)) : 0}px)` }}><Card value={value} suit={index === 0 ? '\u2663' : '\u2665'} progress={scene === 3 ? animate(index === 0 ? 1800 : 5700, 450) : 1} /></span>)}
        </div>
        {scene === 2 && [0, 1, 2].map(index => <span key={index} className='first-hand__flying-chip' aria-hidden='true' style={{ '--chip-x': `${[-95, 95, 0][index]}px`, '--chip-y': `${[0, 0, -75][index]}px`, opacity: animate(700 + index * 2200, 100) * (1 - animate(1800 + index * 2200, 200)), transform: `translate(${[-95, 95, 0][index] * (1 - animate(700 + index * 2200, 1100))}px, ${[0, 0, -75][index] * (1 - animate(700 + index * 2200, 1100))}px)` }}>21</span>)}
        {scene === 6 && <div className='first-hand__victory' style={{ opacity: animate(0, 900) }}><Crown /><strong>21!</strong><span>THE POT IS YOURS</span><i className='first-hand__flying-chip' style={{ opacity: animate(1800, 150) * (1 - animate(3300, 200)), transform: `translateY(${animate(1800, 1700) * 140}px)` }}>21</i></div>}
        {scene === 4 && <div className='first-hand__decision'>
          <span className='first-hand__eyebrow'>EARLIER IN THIS HAND</span>
          <div className='first-hand__decision-tabs' role='group' aria-label='Explore a decision'>{['Hit', 'Stand', 'Double Down'].map((label, index) => <button type='button' aria-pressed={decision === index} className={decision === index ? 'is-selected' : ''} key={label} onClick={() => act({ type: 'checkpoint', index })}>{label}</button>)}</div>
          {decision === 0 && <><div className='first-hand__equation'><Card small value='J' /><b>+</b><Card small value='4' /><b>= 14</b></div><p>Continue through betting to take the next community card.</p></>}
          {decision === 1 && <><strong className='first-hand__locked'>14 <span>LOCKED</span></strong><p>Stand here and keep 14. Later community cards no longer count.</p></>}
          {decision === 2 && <><div className='first-hand__equation'><Card small value='J' /><b>+</b><Card small value='4' /><b>+</b><Card small value='5' /><b>= 19</b></div><p>Round 2, after the first community card. Add a private 5 and lock 19.</p><small>Costs 2 &times; current minimum bet. Later pressure: call or fold.</small></>}
        </div>}
        <div className='first-hand__player'>
          <div className='first-hand__portrait'>{visible && <img src={portraits[3]} alt='Your player portrait' loading='lazy' width='64' height='64' />}{scene === 6 && <span className='first-hand__player-crown'><Crown /></span>}</div>
          <div><b>YOU</b><span>{hand.balance.toLocaleString()} <small>chips</small></span></div>
          {scene >= 1 && <div className='first-hand__private' style={{ opacity: scene === 1 ? animate(300, 500) : 1, transform: `translateY(${scene === 1 ? -55 * (1 - animate(300, 850)) : 0}px)` }}><Card progress={scene === 1 ? animate(1800, 650) : 1} /><strong className={hand.total === 21 ? 'is-21' : ''}>{scene === 1 ? Math.round(10 * animate(2000, 650)) : hand.total}</strong></div>}
        </div>
        {scene === 2 && <div className='first-hand__betting' aria-label='Betting actions being explained'>{['Fold', 'Call', 'Raise'].map((label, index) => <span key={label} className={focusAction === index ? 'is-selected' : ''}>{label}</span>)}</div>}
      </div>
      <div className='first-hand__caption' aria-live='polite' aria-atomic='true'><p>{reading ? (scene === 4 ? ['Hit continues to the next community card.', 'Stand locks your total. Later pressure: call or fold.', 'Double Down: round 2. Pay twice the minimum bet, take a private card, then lock.'][decision] : reading.text) : firstHand.lines[elapsed > firstHand.duration / 2 ? 1 : 0]}</p><small>{reading ? 'Take your time. Tap Continue when ready.' : scene === 4 ? 'Decision example only. Your main hand stays at 21.' : scene === 5 ? 'Everyone stands. Betting settles. Cards reveal.' : scene === 6 ? 'Illustrative hand: 80-chip pot, no rake.' : 'A guided hand. No chips at risk.'}</small></div>
      {scene === 6 && <div className='first-hand__cta'><button type='button' onClick={onPlay}>PLAY NOW</button><button type='button' onClick={() => act({ type: 'replay', playing: !reducedMotion })}>REPLAY TUTORIAL</button></div>}
      <nav className='first-hand__controls' aria-label='Tutorial controls'>
        <div className='first-hand__progress' role='progressbar' aria-label='Tutorial progress' aria-valuemin={1} aria-valuemax={7} aria-valuenow={scene + 1} aria-valuetext={`${scene + 1} of 7`}>{SCENES.map((_, index) => <i key={index} className={index <= scene ? 'is-complete' : ''} />)}</div>
        <div className='first-hand__transport'><button type='button' disabled={scene === 0} onClick={() => act({ type: 'move', direction: -1 })}>Back</button><button type='button' className={reading ? 'first-hand__continue' : ''} aria-label={reading ? 'Continue tutorial' : playing ? 'Pause tutorial' : 'Play tutorial'} onClick={() => act({ type: 'toggle' })}>{reading ? 'Continue' : playing ? 'Pause' : 'Play'}</button><button type='button' disabled={scene === 6} onClick={() => act({ type: 'move', direction: 1 })}>Next</button></div>
        <div className='first-hand__secondary'><button type='button' onClick={() => act({ type: 'replay', playing: !reducedMotion })}>Replay</button><button type='button' disabled={voice.muted} aria-label={voice.enabled ? 'Turn tutorial voice off' : 'Turn tutorial voice on'} aria-pressed={voice.enabled} onClick={voice.toggle}>{voice.muted ? 'Voice muted' : voice.unavailable ? 'Retry voice' : voice.enabled ? 'Voice on' : 'Voice off'}</button><button type='button' onClick={() => act({ type: 'skip' })}>Skip Tutorial</button></div>
      </nav>
    </div>
  </section>;
}
