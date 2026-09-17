import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { register as registerAccount } from 'query/login.query';
import './register.scss';

export default function Register() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [createdEmail, setCreatedEmail] = useState('');
    const [serverError, setServerError] = useState('');
    const { register, handleSubmit, getValues, reset, formState: { errors } } = useForm();
    const { mutate: createAccount, isLoading } = useMutation(registerAccount, {
        onSuccess: (response, account) => {
            if (response.status < 200 || response.status >= 300) {
                setServerError(response?.data?.message || 'We could not create your account. Please try again.');
                return;
            }
            setCreatedEmail(account.sEmail);
            reset();
            const previewLink = response?.data?.data?.oDevMailPreview?.sLink;
            if (previewLink) window.location.assign(previewLink);
        },
        onError: error => setServerError(error?.response?.data?.message || 'We could not create your account. Your details are still here; please try again.'),
    });
    const submit = data => {
        if (isLoading) return;
        setServerError('');
        createAccount({ sEmail: data.email.trim(), sUserName: data.username.trim(), sPassword: data.password });
    };
    const error = name => errors[name] && <small id={`register-${name}-error`} role='alert'>{errors[name].message}</small>;
    return <Modal show centered scrollable className='register-dialog' onHide={() => navigate('/lobby')} backdrop={isLoading ? 'static' : true} keyboard={!isLoading} aria-labelledby='register-title'>
        <Modal.Header closeButton={!isLoading} closeLabel='Close registration'>
            <Modal.Title as='h1' id='register-title'>{createdEmail ? 'Check your inbox' : 'Register'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {createdEmail ? <div className='register-dialog__success'>
                <p role='status'>Your account has been created.</p>
                <p>We’ve sent a verification link to <strong>{createdEmail}</strong>. Open it to verify your email, then sign in using the fields at the top of the app.</p>
                <button className='register-dialog__primary' onClick={() => navigate('/lobby?signin=1')}>Return to the header to sign in</button>
            </div> : <>
                <ol className='register-dialog__steps' aria-label='Getting started'><li><span>1</span>Create account</li><li><span>2</span>Verify email</li><li><span>3</span>Sign in above</li></ol>
                <form onSubmit={handleSubmit(submit)} noValidate>
                    <fieldset disabled={isLoading}>
                        <div className='register-dialog__field'><label htmlFor='register-username'>Player name</label><p id='register-username-help'>At least 4 characters.</p>
                            <input id='register-username' autoComplete='username' maxLength={40} aria-invalid={Boolean(errors.username)} aria-describedby={errors.username ? 'register-username-error' : 'register-username-help'} {...register('username', { required: 'Choose a player name.', validate: value => value.trim().length >= 4 || 'Use at least 4 characters.' })} />{error('username')}
                        </div>
                        <div className='register-dialog__field'><label htmlFor='register-email'>Email address</label>
                            <input id='register-email' type='email' autoComplete='email' inputMode='email' maxLength={254} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'register-email-error' : undefined} {...register('email', { required: 'Enter your email address.', validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) || 'Enter a valid email address.' })} />{error('email')}
                        </div>
                        <div className='register-dialog__field'><label htmlFor='register-password'>Password</label><p id='register-password-help'>8–16 characters, with uppercase, lowercase, a number and a symbol (# ? ! @ $ % ^ &amp; * -).</p>
                            <div className='register-dialog__password'><input id='register-password' type={showPassword ? 'text' : 'password'} autoComplete='new-password' maxLength={16} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'register-password-error register-password-help' : 'register-password-help'} {...register('password', { required: 'Choose a password.', validate: value => /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,16}$/.test(value) || 'Use 8–16 characters with uppercase, lowercase, a number and a symbol.' })} /><button type='button' aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div>{error('password')}
                        </div>
                        <div className='register-dialog__field'><label htmlFor='register-confirm'>Confirm password</label><input id='register-confirm' type={showPassword ? 'text' : 'password'} autoComplete='new-password' maxLength={16} aria-invalid={Boolean(errors.confirm)} aria-describedby={errors.confirm ? 'register-confirm-error' : undefined} {...register('confirm', { required: 'Confirm your password.', validate: value => value === getValues('password') || 'Your passwords do not match.' })} />{error('confirm')}</div>
                        <label className='register-dialog__terms'><input type='checkbox' aria-invalid={Boolean(errors.terms)} aria-describedby={errors.terms ? 'register-terms-error' : undefined} {...register('terms', { required: 'Please agree to the Terms and Privacy Policy.' })} /><span>I agree to the <Link to='/terms-conditions' target='_blank' rel='noreferrer'>Terms</Link> and <Link to='/privacy-policy' target='_blank' rel='noreferrer'>Privacy Policy</Link>.</span></label>{error('terms')}
                        {serverError && <p className='register-dialog__error' role='alert'>{serverError}</p>}
                        <button type='submit' className='register-dialog__primary'>{isLoading ? 'Creating your account…' : 'Create account'}</button>
                    </fieldset>
                </form>
                <p className='register-dialog__signin'>Already have an account? <Link to='/lobby?signin=1'>Use sign-in at the top</Link>.</p>
            </>}
        </Modal.Body>
    </Modal>;
}
