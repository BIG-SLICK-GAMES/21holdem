import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import logo from '../../assets/images/bg/lobby_chip_logo.png';
import './brandSplash.scss';

// Opening presentation only. Direct game links and in-app navigation bypass it.
export default function BrandSplash() {
  const [visible, setVisible] = useState(() => ['/', '/lobby'].includes(window.location.pathname));
  const [ready, setReady] = useState(false);
  const [closing, setClosing] = useState(false);
  const dismissRef = useRef(null);
  const splashRef = useRef(null);

  useEffect(() => {
    if (!visible) return undefined;
    const root = document.getElementById('root');
    const previouslyInert = root?.inert;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    splashRef.current?.showModal();
    dismissRef.current?.focus({ preventScroll: true });
    // A failed or very slow image must never block entry to the site.
    const fallback = window.setTimeout(() => setClosing(true), 5000);
    return () => {
      window.clearTimeout(fallback);
      if (root) root.inert = previouslyInert;
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
    };
  }, [visible]);

  useEffect(() => {
    if (!visible || !ready) return undefined;
    const timer = window.setTimeout(() => setClosing(true), 2800);
    return () => window.clearTimeout(timer);
  }, [visible, ready]);

  useEffect(() => {
    if (!closing) return undefined;
    const timer = window.setTimeout(() => setVisible(false), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500);
    return () => window.clearTimeout(timer);
  }, [closing]);

  if (!visible) return null;
  return createPortal(
    <dialog ref={splashRef} className={`brand-splash${closing ? ' brand-splash--closing' : ''}`} aria-label="21 Hold'em" onCancel={event => { event.preventDefault(); setClosing(true); }} onKeyDown={event => {
      if (event.key === 'Escape') setClosing(true);
      if (event.key === 'Tab') { event.preventDefault(); dismissRef.current?.focus(); }
    }}>
      <div className='brand-splash__identity'>
        <img src={logo} alt='21 crowned logo' width='500' height='501' loading='eager' onLoad={() => setReady(true)} onError={() => setReady(true)} />
        <h1>HOLD&rsquo;EM</h1>
        <div className='brand-splash__rule' aria-hidden='true' />
        <p>Blackjack meets Poker</p>
      </div>
      <button ref={dismissRef} type='button' className='brand-splash__skip' onClick={() => setClosing(true)}>Enter site <span aria-hidden='true'>&rarr;</span></button>
    </dialog>, document.body
  );
}
