import React, { useEffect, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import welcomeBanner from '../../assets/images/bg/lobby_profile_banner.webp';
import dailyBonusBanner from '../../assets/images/bg/lobby_daily_bonus.png';

export default function LobbyBannerCarousel() {
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
            onFocusCapture={(event) => { if (!event.target.closest('.lobby-banner-carousel__playback')) setPlaying(false); }}>
            <Carousel interval={playing ? 6000 : null} slide={!reducedMotion} pause='hover'
                indicatorLabels={['21 Holdem', 'Daily Bonus']}>
                <Carousel.Item>
                    <img src={welcomeBanner} alt='21 Holdem ? where blackjack meets holdem' />
                </Carousel.Item>
                <Carousel.Item>
                    <Link to='/lobby?tab=lobby-missions' aria-label='Daily Bonus ? view Rewards'>
                        <img src={dailyBonusBanner} alt='Daily Bonus' />
                    </Link>
                </Carousel.Item>
            </Carousel>
            <button type='button' className='lobby-banner-carousel__playback' onClick={() => setPlaying(!playing)}
                aria-label={playing ? 'Pause banner rotation' : 'Play banner rotation'}>
                {playing ? 'Pause' : 'Play'}
            </button>
        </section>
    );
}
