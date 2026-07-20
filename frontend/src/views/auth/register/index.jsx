import { register as registerAPI } from 'query/login.query';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { ReactToastify } from 'shared/utils';
import bigSlickGamesLogoImg from '../../../assets/images/bsg/big-slick-games.png';
import { getBigSlickGamesUrl } from '../authDestination';

const Register = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors } } = useForm({ mode: 'onSubmit' });

    const { mutate, isLoading } = useMutation(registerAPI, {
        onSuccess: (response) => {
            if (response.status === 200) {
                const devVerificationLink = response?.data?.data?.oDevMailPreview?.sLink;
                if (devVerificationLink) {
                    window.location.assign(devVerificationLink);
                    return;
                }

                ReactToastify('Account created. Check your email to verify, then return through Big Slick Games.', 'success');
                window.location.assign(getBigSlickGamesUrl());
            } else {
                ReactToastify(response.data.message, 'error');
            }
        },
        onError: (error) => {
            console.error('Registration failed:', error);
            ReactToastify(error?.response?.data?.message || 'Registration failed', 'error');
        },
    });

    const onSubmit = (formData) => {
        mutate({
            sEmail: formData.email,
            sPassword: formData.password,
            sUserName: formData.username,
        });
    };

    return (
        <main className='auth-modern auth-modern--register'>
            <section className='auth-modern__product auth-modern__product--simple' aria-label='Big Slick Games'>
                <div className='auth-modern__brand-lockup'>
                    <img src={bigSlickGamesLogoImg} alt='Big Slick Games' className='auth-modern__logo auth-modern__logo--bsg' />
                    <p className='auth-modern__signup-line'>
                        Create your Big Slick Games profile for the hub, wallet, and game access.
                    </p>
                </div>
            </section>

            <section className='auth-modern__panel' aria-label='Create account form'>
                <form onSubmit={handleSubmit(onSubmit)} className='auth-modern__form'>
                    <label className='auth-modern__field'>
                        <span>Email</span>
                        <input
                            type='email'
                            placeholder='you@example.com'
                            className={errors.email ? 'is-error' : ''}
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                    </label>
                    <label className='auth-modern__field'>
                        <span>Username</span>
                        <input
                            type='text'
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
                    </label>
                    <label className='auth-modern__field'>
                        <span>Password</span>
                        <input
                            type='password'
                            placeholder='8-16 chars, mixed case, number, symbol'
                            className={errors.password ? 'is-error' : ''}
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
                            })}
                        />
                    </label>
                    <label className='auth-modern__check auth-modern__check--terms'>
                        <input
                            type='checkbox'
                            {...register('terms', { required: 'You must accept Terms & Conditions and Privacy Policy' })}
                        />
                        <span>
                            I agree to the <a href='/terms-conditions' target='_blank' rel='noreferrer'>Terms</a>
                            {' '}and <a href='/privacy-policy' target='_blank' rel='noreferrer'>Privacy Policy</a>.
                        </span>
                    </label>
                    <button type='submit' className='auth-modern__submit' disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create BSG account'}
                    </button>
                </form>

                <div className='auth-modern__switch'>
                    <button type='button' onClick={() => navigate('/login')}>Sign in</button>
                </div>
            </section>
        </main>
    );
};

export default Register;
