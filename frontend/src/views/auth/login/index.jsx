import { exchangeHandoff, login } from 'query/login.query';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactToastify, setCookie } from 'shared/utils';
import holdemLogoImg from '../../../assets/images/bg/21HLogo.png';
import liveTablesImg from '../../../assets/images/bg/live_tables.png';
import rewardsImg from '../../../assets/images/bg/daily_rewards_bg.png';
import tableImg from '../../../assets/images/gameplay/portrate_table.png';
import sideBetStraightImg from '../../../assets/images/icons/newstraight.png';
import sideBetFlushImg from '../../../assets/images/icons/newflush.png';
import sideBetTwentyOneImg from '../../../assets/images/icons/new21.png';

const LOGIN_REMEMBER_ME_KEY = 'bsg:remember-me';
const LOGIN_REMEMBERED_IDENTIFIER_KEY = 'bsg:remembered-login';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const handoffCode = searchParams.get('handoffCode');
    const verificationStatus = searchParams.get('verificationStatus');
    const verifiedUserName = searchParams.get('sUserName');

    const [showSplash, setShowSplash] = useState(false);
    const splashTimerRef = useRef(null);

    const goToLobby = (path = '/lobby', opts = {}) => {
        setShowSplash(true);
        splashTimerRef.current = setTimeout(() => {
            navigate(path, { replace: true, ...opts });
        }, 4200);
    };

    useEffect(() => () => {
        if (splashTimerRef.current) clearTimeout(splashTimerRef.current);
    }, []);
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(LOGIN_REMEMBER_ME_KEY) === 'true';
    });

    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({ mode: 'onSubmit' });

    const { mutate, isLoading } = useMutation(login, {
        onSuccess: (data) => {
            if (data.status === 200) {
                setCookie('sAuthToken', data.data.data.authorization, rememberMe ? 14 : undefined);
                goToLobby('/lobby');
            } else {
                ReactToastify(data.data.message, 'error', 'login');
            }
        },
        onError: (error) => {
            console.log(error);
            const devVerificationLink = error?.response?.data?.data?.oDevMailPreview?.sLink;
            if (devVerificationLink) {
                window.location.assign(devVerificationLink);
                return;
            }
            ReactToastify(error.response.data.message, 'error', 'login');
        },
    });

    const { mutate: exchangeHandoffMutate, isLoading: isHandoffLoading } = useMutation(exchangeHandoff, {
        onSuccess: (data) => {
            if (data.status === 200) {
                setCookie('sAuthToken', data.data.data.authorization, 14);
                goToLobby('/lobby', { replace: true });
            } else {
                ReactToastify(data?.data?.message || 'Website handoff failed', 'error', 'handoff');
            }
        },
        onError: (error) => {
            console.log(error);
            ReactToastify(error?.response?.data?.message || error?.response?.data?.detail || 'Website handoff failed', 'error', 'handoff');
            navigate('/login', { replace: true });
        },
    });

    useEffect(() => {
        if (handoffCode) {
            exchangeHandoffMutate({ handoffCode });
        }
    }, [exchangeHandoffMutate, handoffCode]);

    useEffect(() => {
        if (!verificationStatus) return;

        if (verificationStatus === 'success') {
            ReactToastify(verifiedUserName ? `Email verified for ${verifiedUserName}. You can sign in now.` : 'Email verified. You can sign in now.', 'success', 'verification');
        } else if (verificationStatus === 'already') {
            ReactToastify('Email is already verified. Please sign in.', 'success', 'verification');
        } else if (verificationStatus === 'expired') {
            ReactToastify('Verification link expired. Sign in to request a new one.', 'error', 'verification');
        }

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.delete('verificationStatus');
        nextSearchParams.delete('sUserName');
        setSearchParams(nextSearchParams, { replace: true });
    }, [searchParams, setSearchParams, verificationStatus, verifiedUserName]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const rememberedIdentifier = window.localStorage.getItem(LOGIN_REMEMBERED_IDENTIFIER_KEY);
        if (rememberedIdentifier) {
            setValue('email', rememberedIdentifier);
        }
    }, [setValue]);

    function onLogin(data) {
        if (typeof window !== 'undefined') {
            if (rememberMe) {
                window.localStorage.setItem(LOGIN_REMEMBER_ME_KEY, 'true');
                window.localStorage.setItem(LOGIN_REMEMBERED_IDENTIFIER_KEY, data.email);
            } else {
                window.localStorage.removeItem(LOGIN_REMEMBER_ME_KEY);
                window.localStorage.removeItem(LOGIN_REMEMBERED_IDENTIFIER_KEY);
            }
        }

        mutate({
            sEmail: data.email,
            sPassword: data.password,
        });
        reset();
    }

    return (
        <>
        {showSplash && (
            <div className='login-splash' aria-hidden='true'>
                <span className='login-splash__ring' />
                <span className='login-splash__ring login-splash__ring--two' />
                <span className='login-splash__ring login-splash__ring--three' />
                <div className='login-splash__logo-wrap'>
                    <img src={holdemLogoImg} alt="21 Hold'em" className='login-splash__logo' />
                    <span className='login-splash__tagline'>Big Slick Games</span>
                </div>
            </div>
        )}
        <div className='login-background-only'>
            <section className='login-showcase' aria-label="21 Hold'em preview">
                <div className='login-showcase__brand'>
                    <img src={holdemLogoImg} alt="21 Hold'em" />
                    <span>Big Slick Games</span>
                </div>
                <div className='login-showcase__stage'>
                    <article className='login-showcase__panel login-showcase__panel--live'>
                        <img src={liveTablesImg} alt='Live tables lobby preview' />
                        <div className='login-showcase__headline'>Live Tables</div>
                        <div className='login-showcase__mini-row'>
                            <span>1,000</span>
                            <span>5,000</span>
                            <span>15,000</span>
                        </div>
                        <div className='login-showcase__table-summary'>
                            <strong>Starter Table</strong>
                            <span>6 people playing</span>
                        </div>
                        <div className='login-showcase__copy'>
                            <span>Live Tables</span>
                            <strong>Pick a seat and play fast.</strong>
                        </div>
                    </article>
                    <article className='login-showcase__panel login-showcase__panel--play'>
                        <img src={tableImg} alt='21 Holdem table preview' />
                        <div className='login-showcase__table-card'>
                            <span>Pot</span>
                            <strong>$60</strong>
                        </div>
                        <div className='login-showcase__table-watermark'>21 HOLDEM</div>
                        <div className='login-showcase__copy'>
                            <span>21 Hold&apos;em</span>
                            <strong>Blackjack pressure meets poker table action.</strong>
                        </div>
                    </article>
                    <article className='login-showcase__panel login-showcase__panel--bets'>
                        <div className='login-showcase__side-bets'>
                            <div>
                                <img src={sideBetStraightImg} alt='Straight side bet' />
                                <span>10:1</span>
                            </div>
                            <div>
                                <img src={sideBetFlushImg} alt='Flush side bet' />
                                <span>6:1</span>
                            </div>
                            <div>
                                <img src={sideBetTwentyOneImg} alt='21 side bet' />
                                <span>3:1</span>
                            </div>
                        </div>
                        <div className='login-showcase__timer-pill'>7s to place bets</div>
                        <div className='login-showcase__copy'>
                            <span>Side Bets</span>
                            <strong>Straight, Flush, or exactly 21.</strong>
                        </div>
                    </article>
                    <article className='login-showcase__panel login-showcase__panel--rewards'>
                        <img src={rewardsImg} alt='Missions and rewards preview' />
                        <div className='login-showcase__reward-card'>
                            <span>Daily Reward</span>
                            <strong>100</strong>
                            <small>Next unlock 05:08:49</small>
                        </div>
                        <div className='login-showcase__copy'>
                            <span>Missions & Rewards</span>
                            <strong>Daily streaks keep the bankroll moving.</strong>
                        </div>
                    </article>
                </div>
                <div className='login-showcase__dots' aria-hidden='true'>
                    <span />
                    <span />
                    <span />
                    <span />
                </div>
            </section>
            <div className='login-background-only__promo'>
                <span className='login-background-only__promo-kicker'>New players</span>
                <span className='login-background-only__promo-main'>10K Free Chips</span>
            </div>
            <form autoComplete='off' onSubmit={handleSubmit(onLogin)} className='login-background-only__fields'>
                <input
                    type='text'
                    placeholder='Enter email or username'
                    className={`login-background-only__field ${errors.email ? 'login-background-only__field--error' : ''}`}
                    {...register('email', {
                        required: 'Email or Username is Required',
                        validate: (value) => {
                            const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                            const usernamePattern = /^[a-zA-Z0-9_]+$/;
                            if (emailPattern.test(value) || usernamePattern.test(value)) return true;
                            return 'Please enter a valid email or username';
                        },
                    })}
                />
                <input
                    type='password'
                    placeholder='Enter password'
                    className={`login-background-only__field ${errors.password ? 'login-background-only__field--error' : ''}`}
                    {...register('password', {
                        required: 'Password is required',
                        validate: (value) => {
                            const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/;
                            if (!passwordPattern.test(value)) {
                                ReactToastify('Password must be 8-16 characters with a mix of letters, numbers, and a special character.', 'error', 'password');
                                return false;
                            }
                            return true;
                        },
                        minLength: {
                            value: 8,
                            message: 'Password must be at least 8 characters',
                        },
                        maxLength: {
                            value: 16,
                            message: 'Password must be less than 16 characters',
                        },
                    })}
                />
                <div className='login-background-only__field-actions'>
                    <label className='login-background-only__remember'>
                        <input
                            type='checkbox'
                            checked={rememberMe}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                setRememberMe(checked);
                                if (typeof window !== 'undefined') {
                                    if (checked) {
                                        window.localStorage.setItem(LOGIN_REMEMBER_ME_KEY, 'true');
                                    } else {
                                        window.localStorage.removeItem(LOGIN_REMEMBER_ME_KEY);
                                    }
                                }
                            }}
                        />
                        <span>Remember me</span>
                    </label>
                </div>
                <button
                    type='submit'
                    className='login-background-only__submit'
                    disabled={isLoading || isHandoffLoading}
                >
                    {isLoading || isHandoffLoading ? 'Signing In...' : 'Sign In'}
                </button>
                <div className='login-background-only__signup'>
                    <span>Need an account?</span>
                    <button
                        type='button'
                        className='login-background-only__signup-link'
                        onClick={() => navigate('/register')}
                    >
                        Sign Up
                    </button>
                    <button
                        type='button'
                        className='login-background-only__guest-link'
                        onClick={() => navigate('/guest')}
                    >
                        Play as Guest V1.22
                    </button>
                </div>
            </form>
        </div>
        </>
    );
};

export default Login;
