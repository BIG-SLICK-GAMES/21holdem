import { exchangeHandoff, login, register as registerAccount } from 'query/login.query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ReactToastify, setCookie } from 'shared/utils';
import bigSlickGamesLogoImg from '../../../assets/images/bsg/big-slick-games.png';

const LOGIN_REMEMBER_ME_KEY = 'bsg:remember-me';
const LOGIN_REMEMBERED_IDENTIFIER_KEY = 'bsg:remembered-login';

function getInitialMode(pathname) {
    return pathname === '/register' ? 'create' : 'login';
}

const AuthScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [mode, setMode] = useState(() => getInitialMode(location.pathname));
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(LOGIN_REMEMBER_ME_KEY) === 'true';
    });

    const handoffCode = searchParams.get('handoffCode');
    const hubToken = searchParams.get('hubToken');
    const verificationStatus = searchParams.get('verificationStatus');
    const verifiedUserName = searchParams.get('sUserName');

    const isCreateMode = mode === 'create';
    const formTitle = isCreateMode ? 'Create your BSG account' : 'Sign in to Big Slick Games';

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
        setValue,
    } = useForm({ mode: 'onSubmit' });

    const goToLobby = useCallback((opts = {}) => {
        navigate('/lobby', { replace: true, ...opts });
    }, [navigate]);

    const cleanSearchParams = useCallback((keys) => {
        const nextSearchParams = new URLSearchParams(searchParams);
        keys.forEach((key) => nextSearchParams.delete(key));
        setSearchParams(nextSearchParams, { replace: true });
    }, [searchParams, setSearchParams]);

    const saveToken = useCallback((token, days) => {
        const cleanToken = String(token || '').trim().replace(/^Bearer\s+/i, '');
        if (!cleanToken) return false;
        setCookie('sAuthToken', cleanToken, days);
        return true;
    }, []);

    const { mutate: signIn, isLoading: isSignInLoading } = useMutation(login, {
        onSuccess: (response) => {
            const token = response?.data?.data?.authorization || response?.headers?.authorization || response?.headers?.Authorization;
            if (response.status === 200 && saveToken(token, rememberMe ? 14 : undefined)) {
                goToLobby();
                return;
            }

            ReactToastify(response?.data?.message || 'Sign in failed', 'error', 'login');
        },
        onError: (error) => {
            const devVerificationLink = error?.response?.data?.data?.oDevMailPreview?.sLink;
            if (devVerificationLink) {
                window.location.assign(devVerificationLink);
                return;
            }

            ReactToastify(error?.response?.data?.message || 'Sign in failed', 'error', 'login');
        },
    });

    const { mutate: createAccount, isLoading: isCreateLoading } = useMutation(registerAccount, {
        onSuccess: (response) => {
            const devVerificationLink = response?.data?.data?.oDevMailPreview?.sLink;
            if (devVerificationLink) {
                window.location.assign(devVerificationLink);
                return;
            }

            ReactToastify('Account created. Check your email to verify, then sign in.', 'success', 'register');
            setMode('login');
            navigate('/login', { replace: true });
            reset({ email: '', username: '', password: '', terms: false });
        },
        onError: (error) => {
            ReactToastify(error?.response?.data?.message || 'Registration failed', 'error', 'register');
        },
    });

    const { mutate: exchangeHandoffCode, isLoading: isHandoffLoading } = useMutation(exchangeHandoff, {
        onSuccess: (response) => {
            const token = response?.data?.data?.authorization || response?.headers?.authorization || response?.headers?.Authorization;
            if (response.status === 200 && saveToken(token, 14)) {
                cleanSearchParams(['handoffCode']);
                goToLobby({ replace: true });
                return;
            }

            ReactToastify(response?.data?.message || 'Website handoff failed', 'error', 'handoff');
        },
        onError: (error) => {
            cleanSearchParams(['handoffCode']);
            ReactToastify(error?.response?.data?.message || error?.response?.data?.detail || 'Website handoff failed', 'error', 'handoff');
        },
    });

    const isSubmitting = isSignInLoading || isCreateLoading || isHandoffLoading;

    useEffect(() => {
        setMode(getInitialMode(location.pathname));
    }, [location.pathname]);

    useEffect(() => {
        if (!hubToken) return;

        if (saveToken(hubToken, 14)) {
            cleanSearchParams(['hubToken', 'from']);
            goToLobby({ replace: true });
        }
    }, [cleanSearchParams, goToLobby, hubToken, saveToken]);

    useEffect(() => {
        if (handoffCode) exchangeHandoffCode({ handoffCode });
    }, [exchangeHandoffCode, handoffCode]);

    useEffect(() => {
        if (!verificationStatus) return;

        if (verificationStatus === 'success') {
            ReactToastify(verifiedUserName ? `Email verified for ${verifiedUserName}. You can sign in now.` : 'Email verified. You can sign in now.', 'success', 'verification');
        } else if (verificationStatus === 'already') {
            ReactToastify('Email is already verified. Please sign in.', 'success', 'verification');
        } else if (verificationStatus === 'expired') {
            ReactToastify('Verification link expired. Sign in to request a new one.', 'error', 'verification');
        }

        cleanSearchParams(['verificationStatus', 'sUserName']);
    }, [cleanSearchParams, verificationStatus, verifiedUserName]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const rememberedIdentifier = window.localStorage.getItem(LOGIN_REMEMBERED_IDENTIFIER_KEY);
        if (rememberedIdentifier) setValue('email', rememberedIdentifier);
    }, [setValue]);

    const passwordRules = useMemo(() => ({
        required: 'Password is required',
        minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
        },
        maxLength: {
            value: 16,
            message: 'Password must be less than 16 characters',
        },
    }), []);

    function switchMode(nextMode) {
        setMode(nextMode);
        navigate(nextMode === 'create' ? '/register' : '/login', { replace: true });
        reset({ email: '', username: '', password: '', terms: false });
    }

    function onSubmit(data) {
        if (isCreateMode) {
            createAccount({
                sEmail: data.email,
                sPassword: data.password,
                sUserName: data.username,
            });
            return;
        }

        if (typeof window !== 'undefined') {
            if (rememberMe) {
                window.localStorage.setItem(LOGIN_REMEMBER_ME_KEY, 'true');
                window.localStorage.setItem(LOGIN_REMEMBERED_IDENTIFIER_KEY, data.email);
            } else {
                window.localStorage.removeItem(LOGIN_REMEMBER_ME_KEY);
                window.localStorage.removeItem(LOGIN_REMEMBERED_IDENTIFIER_KEY);
            }
        }

        signIn({
            sEmail: data.email,
            sPassword: data.password,
        });
    }

    return (
        <main className='bsg-auth' aria-label='Big Slick Games authentication'>
            <section className='bsg-auth__panel' aria-label={formTitle}>
                <div className='bsg-auth__mobile-brand'>
                    <img src={bigSlickGamesLogoImg} alt='Big Slick Games' />
                </div>

                <div className='bsg-auth__mode' role='tablist' aria-label='Authentication mode'>
                    <button type='button' className={!isCreateMode ? 'is-active' : ''} onClick={() => switchMode('login')} role='tab' aria-selected={!isCreateMode}>
                        Sign in
                    </button>
                    <button type='button' className={isCreateMode ? 'is-active' : ''} onClick={() => switchMode('create')} role='tab' aria-selected={isCreateMode}>
                        Create account
                    </button>
                </div>

                <div className='bsg-auth__heading'>
                    <h2>{formTitle}</h2>
                </div>

                <form className='bsg-auth__form' onSubmit={handleSubmit(onSubmit)} noValidate>
                    <label className='bsg-auth__field'>
                        <span>{isCreateMode ? 'Email' : 'Email or username'}</span>
                        <input
                            type={isCreateMode ? 'email' : 'text'}
                            autoComplete={isCreateMode ? 'email' : 'username'}
                            placeholder={isCreateMode ? 'you@example.com' : 'you@example.com'}
                            className={errors.email ? 'is-error' : ''}
                            {...register('email', {
                                required: isCreateMode ? 'Email is required' : 'Email or username is required',
                                validate: (value) => {
                                    const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
                                    const usernamePattern = /^[a-zA-Z0-9_]+$/;
                                    if (isCreateMode) return emailPattern.test(value) || 'Enter a valid email address';
                                    return emailPattern.test(value) || usernamePattern.test(value) || 'Enter a valid email or username';
                                },
                            })}
                        />
                        {errors.email?.message && <small>{errors.email.message}</small>}
                    </label>

                    {isCreateMode && (
                        <label className='bsg-auth__field'>
                            <span>Username</span>
                            <input
                                type='text'
                                autoComplete='username'
                                placeholder='Choose a table name'
                                className={errors.username ? 'is-error' : ''}
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: {
                                        value: 4,
                                        message: 'Username must be at least 4 characters',
                                    },
                                })}
                            />
                            {errors.username?.message && <small>{errors.username.message}</small>}
                        </label>
                    )}

                    <label className='bsg-auth__field'>
                        <span>Password</span>
                        <input
                            type='password'
                            autoComplete={isCreateMode ? 'new-password' : 'current-password'}
                            placeholder={isCreateMode ? '8-16 chars, mixed case, number, symbol' : 'Enter your password'}
                            className={errors.password ? 'is-error' : ''}
                            {...register('password', isCreateMode ? {
                                ...passwordRules,
                                validate: (value) => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(value)
                                    || 'Use 8-16 characters with mixed case, number, and symbol',
                            } : passwordRules)}
                        />
                        {errors.password?.message && <small>{errors.password.message}</small>}
                    </label>

                    <div className='bsg-auth__options'>
                        {!isCreateMode ? (
                            <label className='bsg-auth__check'>
                                <input
                                    type='checkbox'
                                    checked={rememberMe}
                                    onChange={(event) => setRememberMe(event.target.checked)}
                                />
                                <span>Remember this device</span>
                            </label>
                        ) : (
                            <label className='bsg-auth__check'>
                                <input
                                    type='checkbox'
                                    className={errors.terms ? 'is-error' : ''}
                                    {...register('terms', { required: 'Accept the Terms and Privacy Policy to continue' })}
                                />
                                <span>
                                    I agree to the <a href='/terms-conditions' target='_blank' rel='noreferrer'>Terms</a>
                                    {' '}and <a href='/privacy-policy' target='_blank' rel='noreferrer'>Privacy Policy</a>.
                                </span>
                            </label>
                        )}
                    </div>
                    {errors.terms?.message && <small className='bsg-auth__form-error'>{errors.terms.message}</small>}

                    <button type='submit' className='bsg-auth__submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Working...' : isCreateMode ? 'Create BSG account' : 'Sign in securely'}
                    </button>

                    <a className='bsg-auth__direct-game' href='/lobby'>
                        Take me directly to 21 Hold&apos;em
                    </a>
                </form>
            </section>
        </main>
    );
};

export default AuthScreen;
