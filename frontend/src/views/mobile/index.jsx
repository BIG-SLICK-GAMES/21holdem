import React, { lazy, Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from 'react-query';
import useAuthToken from '../../shared/hooks/useAuthToken';
import { setCookie } from '../../shared/utils';
import { login, register } from '../../query/login.query';
import { getProfile } from '../../query/profile.query';
import { getTables, joinTable } from '../../query/gameTable.query';
import DailyRewardsPanel from '../../shared/components/DailyRewardsPanel';
import CosmeticShop from '../../shared/components/CosmeticShop';
import { HOW_TO_PLAY_SECTIONS } from '../../shared/content/gameGuideContent';
import { Card } from './Cards';
import Practice from './Practice';
import './mobile.scss';

const Game = lazy(() => import('../game'));
const number = value => Number(value || 0).toLocaleString();
function readEasy() { try { return localStorage.getItem('21ucd:easy-view') === 'true'; } catch { return false; } }

function Account({ creating = false, onDone }) {
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');
    const client = useQueryClient();
    async function submit(e) {
        e.preventDefault();
        if (busy) return;
        const data = new FormData(e.currentTarget);
        setBusy(true); setMessage('');
        try {
            const payload = { sEmail: data.get('email').trim(), sPassword: data.get('password') };
            const response = await (creating ? register({ ...payload, sUserName: data.get('username').trim() }) : login(payload));
            if (creating) { setMessage('Account created. Check your email to verify your account, then sign in at the top of this page.'); return; }
            const token = response.data?.data?.authorization || response.headers?.authorization;
            if (!token) throw new Error(response.data?.message || 'Unable to sign in.');
            setCookie('sAuthToken', String(token).replace(/^Bearer\s+/i, ''), 14);
            client.invalidateQueries(); onDone?.();
        } catch (error) { setMessage(error.response?.data?.message || error.message || 'Unable to connect. Please try again.'); }
        finally { setBusy(false); }
    }
    return <form className="ucd-stack ucd-account" onSubmit={submit}>
        {creating && <label>Username<input name="username" autoComplete="username" required minLength={3} /></label>}
        <label>{creating ? 'Email' : 'Email or username'}<input name="email" type={creating ? 'email' : 'text'} autoComplete={creating ? 'email' : 'username'} autoCapitalize="none" spellCheck="false" required /></label>
        <label>Password<input name="password" type="password" autoComplete={creating ? 'new-password' : 'current-password'} required minLength={creating ? 8 : undefined} /></label>
        {creating && <label className="ucd-check"><input type="checkbox" required />I agree to the <a href="/terms-conditions" target="_blank" rel="noreferrer">terms and conditions</a>.</label>}
        <button className="ucd-primary" disabled={busy}>{busy ? 'Please wait…' : creating ? 'Create account' : 'Sign in'}</button>
        {message && <p role="status">{message}</p>}
    </form>;
}

function Lobby({ token, profile }) {
    const navigate = useNavigate();
    const [joining, setJoining] = useState('');
    const [error, setError] = useState('');
    const tables = useQuery(['ucd-tables', token], () => getTables('public'), { enabled: Boolean(token), select: r => Array.isArray(r.data?.data) ? r.data.data : [] });
    async function join(table) {
        if (joining) return;
        setJoining(table._id); setError('');
        try {
            const response = await joinTable(table._id);
            const boardId = response.data?.data?.iBoardId;
            if (!boardId) throw new Error(response.data?.message || 'Unable to join table.');
            navigate('/mobile/game', { state: { iBoardId: boardId, fallbackPath: '/mobile' } });
        } catch (e) { setError(e.response?.data?.message || e.message); }
        finally { setJoining(''); }
    }
    return <>
        <section className="ucd-welcome"><span className="ucd-eyebrow">YOUR TABLE. A CLEARER VIEW.</span><h1>Big cards.<br />Room to play.</h1><p>A little less clutter.<br />More of the game you love.</p><div className="ucd-hero-cards" aria-hidden="true"><Card card={{ nLabel: 11, eSuit: 's' }} /><Card card={{ nLabel: 1, eSuit: 'h' }} /></div><Link className="ucd-primary ucd-wide" to="/mobile/practice">Try a practice hand <span aria-hidden="true">→</span></Link><span className="ucd-muted">No timer · No sign-in · No chips spent</span></section>
        <section className="ucd-section"><span className="ucd-eyebrow">READY WHEN YOU ARE</span><h2>Live tables</h2>
        {profile?.aPokerBoard?.[0] && <Link className="ucd-primary ucd-wide" to="/mobile/game" state={{ iBoardId: profile.aPokerBoard[0], fallbackPath: '/mobile' }}>Return to your table</Link>}
        {!token ? <p>Sign in at the top to join a live table. Or try the practice hand first.</p> : tables.isLoading ? <p role="status">Finding your tables…</p> : tables.isError ? <><p>We couldn’t load the tables.</p><button onClick={() => tables.refetch()}>Try again</button></> : <div className="ucd-stack">{(tables.data || []).map(table => <article className="ucd-table-choice" key={table._id}><div><h3>{table.sName}</h3><p>{table.nMaxPlayer} seats · Blinds {number(table.nMinBet)} / {number(table.nMinBet * 2)}</p><strong>{number(table.nMinBuyIn)} chips to join</strong></div><button className="ucd-primary" disabled={Boolean(joining) || Number(profile?.nChips) < Number(table.nMinBuyIn)} onClick={() => join(table)}>{joining === table._id ? 'Joining…' : Number(profile?.nChips) < Number(table.nMinBuyIn) ? 'Not enough chips' : 'Join table'}</button></article>)}{!tables.data?.length && <p>No tables are available right now. Please try again later.</p>}</div>}
        {error && <p role="alert">{error}</p>}<p className="ucd-muted">Live games have timed turns and use your account chips.</p></section>
        <Link className="ucd-link-row" to="/mobile/learn">New to 21 Hold’em? Learn the rules <span aria-hidden="true">→</span></Link>
    </>;
}

export default function MobileExperience() {
    const client = useQueryClient();
    const token = useAuthToken();
    const location = useLocation();
    const navigate = useNavigate();
    const [easy, setEasy] = useState(readEasy);
    const [signIn, setSignIn] = useState(false);
    const game = location.pathname === '/mobile/game' && Boolean(token);
    const profile = useQuery(['profileData', 'ucd', token], getProfile, { enabled: Boolean(token), select: r => r.data?.data });
    useEffect(() => {
        if (new URLSearchParams(location.search).get('signin') === '1') setSignIn(true);
    }, [location.search]);
    useEffect(() => {
        document.body.classList.add('ucd-mobile-active');
        document.documentElement.classList.add('ucd-mobile-page');
        const previousTitle = document.title;
        document.title = '21 Hold’em · Mobile';
        const refresh = () => client.invalidateQueries(['profileData', 'ucd']);
        window.addEventListener('bsg:profile-refresh', refresh);
        return () => { document.body.classList.remove('ucd-mobile-active'); document.documentElement.classList.remove('ucd-mobile-page'); document.title = previousTitle; window.removeEventListener('bsg:profile-refresh', refresh); };
    }, [client]);
    useEffect(() => {
        if (!game) window.scrollTo(0, 0);
        const onNavigate = e => { const path = String(e.detail?.path || '/mobile'); navigate(path.startsWith('/mobile') ? path : '/mobile'); };
        window.addEventListener('bsg:navigate', onNavigate);
        return () => window.removeEventListener('bsg:navigate', onNavigate);
    }, [location.pathname, game, navigate]);
    function toggleEasy() { setEasy(value => { try { localStorage.setItem('21ucd:easy-view', String(!value)); } catch {} return !value; }); }
    return <div className={`ucd-mobile${easy ? ' ucd-easy' : ''}`}>
        <a className="ucd-skip" href="#ucd-main">Skip to content</a>
        <header className="ucd-header"><div className="ucd-between"><Link className="ucd-brand" to="/mobile" onClick={e => { if (game) { e.preventDefault(); window.dispatchEvent(new CustomEvent('bsg:game-action-overlay-command', { detail: { command: 'exitTable' } })); } }}><b>21</b><span>HOLD’EM<small>MOBILE</small></span></Link><button className="ucd-easy-toggle" onClick={toggleEasy} aria-pressed={easy}><b aria-hidden="true">Aa</b> Easy View {easy ? 'on' : 'off'}</button></div>
        {!game && (token ? <p className="ucd-balance">{profile.data?.sUserName || 'Your account'} <strong>{profile.data ? `${number(profile.data.nChips)} chips` : 'Loading balance…'}</strong></p> : <><div className="ucd-auth-actions"><button aria-expanded={signIn} onClick={() => setSignIn(!signIn)}>Sign in</button><Link to="/mobile/signup">Create account</Link></div>{signIn && <Account onDone={() => setSignIn(false)} />}</>)}</header>
        <main id="ucd-main" className="ucd-main"><Suspense fallback={<p role="status">Loading your table…</p>}><Routes>
            <Route index element={<Lobby token={token} profile={profile.data} />} />
            <Route path="practice" element={<Practice />} />
            <Route path="game" element={token ? <Game accessibleMode /> : <p>Please sign in at the top before joining a live table.</p>} />
            <Route path="rewards" element={<><span className="ucd-eyebrow">A LITTLE SOMETHING EVERY DAY</span><DailyRewardsPanel loginPath="/mobile?signin=1" /></>} />
            <Route path="shop" element={<><span className="ucd-eyebrow">MAKE YOURSELF AT HOME</span><h1>Your table. Your style.</h1><p>Table and room sets cost 500 chips each. Equip a set after buying it.</p><CosmeticShop /></>} />
            <Route path="signup" element={<><h1>Create your account</h1><p>One account for your chips and table styles.</p><Account creating /></>} />
            <Route path="learn" element={<><h1>Learn at your pace</h1><Link className="ucd-primary ucd-wide" to="/mobile/practice">Try the guided hand</Link>{HOW_TO_PLAY_SECTIONS.map(section => <section className="ucd-section" key={section.title}><h2>{section.title}</h2>{section.paragraphs?.map(p => <p key={p}>{p}</p>)}{section.bullets && <ul>{section.bullets.map(p => <li key={p}>{p}</li>)}</ul>}</section>)}</>} />
            <Route path="view" element={<><span className="ucd-eyebrow">COMFORT COMES FIRST</span><h1>Make it easy to see</h1><section className="ucd-section"><h2>Easy View</h2><p>Larger text and cards, stronger outlines and more space between controls.</p><button className="ucd-primary ucd-wide" aria-pressed={easy} onClick={toggleEasy}>Easy View {easy ? 'on · turn off' : 'off · turn on'}</button></section><section className="ucd-section"><h2>At your pace</h2><p>You can zoom this page using your browser. The layout will wrap to fit. Reduced-motion preferences are respected. Live-table sound starts off.</p><Link to="/mobile/practice">Try your settings in practice →</Link></section><a className="ucd-link-row" href="/lobby">Go to the standard website →</a></>} />
            <Route path="*" element={<><h1>Page not found</h1><Link to="/mobile">Back to the mobile lobby</Link></>} />
        </Routes></Suspense></main>
        {!game && <nav className="ucd-nav" aria-label="Mobile navigation">{[['', '♠', 'Play'], ['/rewards', '✦', 'Rewards'], ['/shop', '◇', 'Shop'], ['/view', 'Aa', 'View']].map(([path, icon, label]) => <NavLink key={label} to={`/mobile${path}`} end={!path}><span aria-hidden="true">{icon}</span>{label}</NavLink>)}</nav>}
    </div>;
}
