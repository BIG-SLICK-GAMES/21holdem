import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import welcomeBanner from '../../assets/images/bg/lobby_profile_banner.webp';
import dailyBonusBanner from '../../assets/images/bg/lobby_daily_bonus.png';
import blackjackBanner from '../../assets/images/bg/lobby_blackjack_scoring.png';

export default function LobbyBannerCarousel() {
    const [hidden, setHidden] = useState(() => {
        try { return window.localStorage.getItem('21ucd:advertising-hidden') === 'true'; }
        catch { return false; }
    });
    const toggleAdvertising = () => {
        const next = !hidden;
        setHidden(next);
        try { window.localStorage.setItem('21ucd:advertising-hidden', String(next)); }
        catch { /* The control still works when browser storage is unavailable. */ }
    };
    return (
        <div className='lobby-advertising'>
            <button type='button' className='lobby-advertising__toggle' aria-expanded={!hidden} aria-controls='lobby-advertising-content' onClick={toggleAdvertising}>
                <span className='lobby-advertising__line' aria-hidden='true' />
                <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' focusable='false'>
                    <path d={hidden ? 'm9 5 7 7-7 7' : 'm5 9 7 7 7-7'} />
                </svg>
                <span>{hidden ? 'Show advertising' : 'Hide advertising'}</span>
                <span className='lobby-advertising__line' aria-hidden='true' />
            </button>
            <div id='lobby-advertising-content' hidden={hidden}>
                {!hidden && <AdvertisingCarousel />}
            </div>
        </div>
    );
}

function AdvertisingCarousel() {
    const [playing, setPlaying] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(true);
    useEffect(() => {
        const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => { setReducedMotion(preference.matches); setPlaying(!preference.matches); };
        update();
        preference.addEventListener('change', update);
        return () => preference.removeEventListener('change', update);
    }, []);
    return (
        <section className='dashboard-hub__lobby-banner lobby-banner-carousel' aria-label='Featured promotions'
            onFocusCapture={() => setPlaying(false)}>
            <Carousel interval={playing ? 6000 : null} slide={!reducedMotion} pause='hover'
                controls={false} indicators={false}>
                <Carousel.Item>
                    <img src={welcomeBanner} alt='21 Holdem ? where blackjack meets holdem' />
                </Carousel.Item>
                <Carousel.Item>
                    <Link to='/lobby?tab=lobby-missions' aria-label='Daily Bonus ? view Rewards'>
                        <img src={dailyBonusBanner} alt='Daily Bonus' />
                    </Link>
                </Carousel.Item>
                <Carousel.Item>
                    <Link to='/lobby?tab=lobby-how-to-play' aria-label='Blackjack scoring with poker pressure ? learn how to play'>
                        <img src={blackjackBanner} alt='Blackjack scoring with poker pressure' />
                    </Link>
                </Carousel.Item>
            </Carousel>
        </section>
    );
}
