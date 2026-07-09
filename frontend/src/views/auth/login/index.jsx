import { exchangeHandoff, login } from 'query/login.query';
import React, { useEffect, useRef, useState } from 'react';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ReactToastify, setCookie } from 'shared/utils';
import holdemLogoImg from '../../../assets/images/bg/21HLogo.png';
import loadingSplashImg from '../../../assets/images/splash/21holdem-loading.png';
import { getBigSlickGamesUrl } from '../authDestination';

const LOGIN_REMEMBER_ME_KEY = 'bsg:remember-me';
const LOGIN_REMEMBERED_IDENTIFIER_KEY = 'bsg:remembered-login';

const Login = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const handoffCode = searchParams.get('handoffCode');
    const hubToken = searchParams.get('hubToken');
    const verificationStatus = searchParams.get('verificationStatus');
    const verifiedUserName = searchParams.get('sUserName');

    const [showSplash, setShowSplash] = useState(false);
    const splashTimerRef = useRef(null);

    const goToBigSlickGames = (opts = {}) => {
        setShowSplash(true);
        splashTimerRef.current = setTimeout(() => {
            const destination = getBigSlickGamesUrl();
            if (typeof window !== 'undefined') {
                window.location.assign(destination);
                return;
            }
            navigate('/', { replace: true, ...opts });
        }, 1800);
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
                goToBigSlickGames();
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
                goToBigSlickGames({ replace: true });
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
        if (hubToken) {
            setCookie('sAuthToken', hubToken, 14);

            const nextSearchParams = new URLSearchParams(searchParams);
            nextSearchParams.delete('hubToken');
            nextSearchParams.delete('from');
            setSearchParams(nextSearchParams, { replace: true });
            goToBigSlickGames({ replace: true });
        }
    }, [hubToken, searchParams, setSearchParams]);

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
                    <img src={loadingSplashImg} alt='' className='login-splash__image' />
                </div>
            )}
            <main className='auth-modern auth-modern--login'>
                <section className='auth-modern__product auth-modern__product--simple' aria-label="Big Slick Games 21 Hold'em">
                    <div className='auth-modern__brand-lockup'>
                        <img src={holdemLogoImg} alt="21 Hold'em" className='auth-modern__logo' />
                        <p className='auth-modern__signup-line'>
                            You are signing up to Big Slick Games - The home of 21 Hold&apos;em.
                        </p>
                    </div>
                </section>

                <section className='auth-modern__panel' aria-label='Sign in form'>
                    <form autoComplete='off' onSubmit={handleSubmit(onLogin)} className='auth-modern__form'>
                        <label className='auth-modern__field'>
                            <span>Email or username</span>
                            <input
                                type='text'
                                placeholder='you@example.com'
                                className={errors.email ? 'is-error' : ''}
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
                        </label>
                        <label className='auth-modern__field'>
                            <span>Password</span>
                            <input
                                type='password'
                                placeholder='Enter your password'
                                className={errors.password ? 'is-error' : ''}
                                {...register('password', {
                                    required: 'Password is required',
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
                        </label>
                        <div className='auth-modern__row'>
                            <label className='auth-modern__check'>
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
                        <button type='submit' className='auth-modern__submit' disabled={isLoading || isHandoffLoading}>
                            {isLoading || isHandoffLoading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    <div className='auth-modern__switch'>
                        <span>Need an account?</span>
                        <button type='button' onClick={() => navigate('/register')}>Sign up</button>
                    </div>
                </section>
            </main>
        </>
    );
};

export default Login;
