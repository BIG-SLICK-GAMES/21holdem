import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { getDailyRewards, getDailyRewardsPreview, updateDailyRewards } from 'query/dailyRewards.query';
import { getCookie, ReactToastify } from 'shared/utils';
import { useNavigate } from 'react-router-dom';
import './dailyPrize.scss';
import chestClosed from 'assets/images/rewards/daily-chest-closed.webp';
import chestOpen from 'assets/images/rewards/daily-chest-open.webp';

const amount = (value) => Number(value || 0).toLocaleString('en-US');
const countdown = (ms) => {
    const seconds = Math.max(0, Math.ceil(ms / 1000));
    return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60].map((n) => String(n).padStart(2, '0')).join(':');
};

export default function DailyRewardsPanel({ embedded = false }) {
    const navigate = useNavigate();
    const signedIn = Boolean(getCookie('sAuthToken'));
    const client = useQueryClient();
    const key = signedIn ? 'getDailyRewards' : 'dailyRewardsPreview';
    const [now, setNow] = useState(Date.now());
    const [opening, setOpening] = useState(false);
    const [revealed, setRevealed] = useState(null);
    const revealTimer = useRef(null);
    const claimedRef = useRef(false);
    const { data, isLoading, isError, refetch, dataUpdatedAt } = useQuery(key, signedIn ? getDailyRewards : getDailyRewardsPreview, {
        select: (response) => response?.data?.data,
        refetchOnWindowFocus: true,
    });
    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 1000);
        return () => { window.clearInterval(timer); window.clearTimeout(revealTimer.current); };
    }, []);
    const serverOffset = data?.dServerNow ? new Date(data.dServerNow).getTime() - dataUpdatedAt : 0;
    const remaining = new Date(data?.dNextClaimAt).getTime() - (now + serverOffset);
    useEffect(() => {
        if (remaining <= 0) {
            claimedRef.current = false;
            setRevealed(null);
            refetch();
        }
    }, [remaining, refetch]);
    const mutation = useMutation(updateDailyRewards, {
        onSuccess: (response) => {
            const payload = response?.data?.data;
            if (!payload?.prize || !payload?.bTodayRewardClaimed) {
                setOpening(false);
                claimedRef.current = false;
                client.invalidateQueries(key);
                ReactToastify(response?.data?.message || 'Unable to claim reward', 'error');
                return;
            }
            client.invalidateQueries('profileData');
            revealTimer.current = window.setTimeout(() => {
                setRevealed(payload.prize);
                setOpening(false);
                client.invalidateQueries(key);
            }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1500);
        },
        onError: (error) => {
            setOpening(false);
            claimedRef.current = false;
            client.invalidateQueries(key);
            ReactToastify(error?.response?.data?.message || 'Unable to claim reward. Please try again.', 'error');
        },
    });
    const claimed = Boolean(data?.bTodayRewardClaimed || revealed);
    const prize = revealed || data?.prize;
    const prizes = data?.prizes || [];
    const unavailable = !isLoading && !isError && !prizes.length;
    const claim = () => {
        if (!signedIn) { navigate('/login'); return; }
        if (claimed || claimedRef.current || opening || mutation.isLoading || isLoading || isError || unavailable) return;
        claimedRef.current = true;
        setOpening(true);
        mutation.mutate();
    };
    const label = opening ? 'Opening your prize...' : claimed ? "Today's prize collected" : !signedIn ? 'Sign in to open' : 'Open your daily prize';
    return (
        <section className={`daily-prize${embedded ? ' daily-prize--embedded' : ''}`} aria-labelledby='daily-prize-title'>
            <header>
                <span className='daily-prize__eyebrow'>ONE DAY. ONE SURPRISE.</span>
                <h2 id='daily-prize-title'>Your daily treasure</h2>
                <p>A mystery prize from the shop, on us. Open it and see what's inside.</p>
            </header>
            <button type='button' className={`daily-prize__chest${opening ? ' is-opening' : ''}${claimed && !opening ? ' is-open' : ''}`}
                onClick={claim} disabled={claimed || opening || isLoading || isError || unavailable} aria-label={label} aria-busy={opening}>
                <span className='daily-prize__halo' aria-hidden='true' />
                <span className='daily-prize__rays' aria-hidden='true' />
                <span className='daily-prize__art' aria-hidden='true'>
                    <img className='daily-prize__closed' src={chestClosed} alt='' draggable='false' />
                    <img className='daily-prize__opened' src={chestOpen} alt='' draggable='false' />
                </span>
                <span className='daily-prize__sparkles' aria-hidden='true'>{Array.from({ length: 8 }, (_, i) => <i key={i} style={{ '--i': i }} />)}</span>
            </button>
            <div className='daily-prize__status' aria-live='polite' aria-atomic='true'>
                {isError ? <><p>We couldn't load today's prizes.</p><button type='button' onClick={() => refetch()}>Try again</button></> : unavailable ? <p>Prizes are being restocked. Check back soon.</p> : opening ? <strong>Opening your prize...</strong> : claimed ? <>
                    <span className='daily-prize__eyebrow'>COLLECTED TODAY</span>
                    <h3>{prize?.sTitle || 'Daily reward'}</h3>
                    {prize && <strong className='daily-prize__amount'>+{amount(prize.nChips)} chips</strong>}
                    <p>{prize ? 'Added to your balance. Enjoy the tables!' : 'Your reward has already been collected.'}</p>
                </> : <button type='button' className='daily-prize__open' onClick={claim} disabled={isLoading}>{isLoading ? 'Loading prizes...' : label}<span aria-hidden='true'> &rarr;</span></button>}
            </div>
            {claimed && !opening && <p className='daily-prize__countdown'>Your next treasure opens in <strong>{countdown(remaining)}</strong></p>}
            <p className='daily-prize__note'>One free prize per day. Resets at 00:00 UTC. No streaks to keep.</p>
            {prizes.length > 0 && <details className='daily-prize__pool'><summary>What could be inside? <span>{prizes.length} shop prizes</span></summary>
                <ul>{prizes.map((item, index) => <li key={`${item.sShopItemId}-${index}`}><span>{item.sTitle}</span><strong>{amount(item.nChips)} chips</strong></li>)}</ul>
                <p>Every listed package has an equal chance. New shop packages join automatically.</p>
            </details>}
        </section>
    );
}
DailyRewardsPanel.propTypes = { embedded: PropTypes.bool };
