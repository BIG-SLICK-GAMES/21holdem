import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

export default function PlayerTurnTimer({ endsAt, totalMs }) {
    const [now, setNow] = useState(Date.now);
    useEffect(() => {
        setNow(Date.now());
        const interval = window.setInterval(() => setNow(Date.now()), 100);
        return () => window.clearInterval(interval);
    }, [endsAt]);
    const remaining = Math.max(0, endsAt - now);
    const progress = Math.min(1, remaining / Math.max(1, totalMs));
    return <span className={`game-table-page__turn-timer${remaining <= 3000 ? ' is-low' : ''}`}>
        <svg viewBox='0 0 100 100' aria-hidden='true'>
            <circle className='game-table-page__turn-timer-track' cx='50' cy='50' r='46' />
            <circle className='game-table-page__turn-timer-progress' cx='50' cy='50' r='46' pathLength='1' strokeDasharray={`${progress} 1`} />
        </svg>
        <span className='game-table-page__turn-timer-seconds' aria-label={`${Math.ceil(remaining / 1000)} seconds remaining`}>{Math.ceil(remaining / 1000)}</span>
    </span>;
}
PlayerTurnTimer.propTypes = { endsAt: PropTypes.number.isRequired, totalMs: PropTypes.number.isRequired };
