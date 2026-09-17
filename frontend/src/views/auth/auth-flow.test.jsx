import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import Register from './register';
import LoginRedirect from './login';
import { register as registerAccount, exchangeHandoff } from 'query/login.query';
import { setCookie, ReactToastify } from 'shared/utils';

jest.mock('query/login.query', () => ({ register: jest.fn(), exchangeHandoff: jest.fn() }));
jest.mock('shared/utils', () => ({ setCookie: jest.fn(), ReactToastify: jest.fn() }));
jest.setTimeout(30000);
function Destination() {
    const location = useLocation();
    return <p>Destination: {location.pathname}{location.search}</p>;
}
function mount(path = '/register') {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } }, logger: { log: () => {}, warn: () => {}, error: () => {} } });
    return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[path]}><Routes>
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<LoginRedirect />} />
        <Route path='/lobby' element={<Destination />} />
    </Routes></MemoryRouter></QueryClientProvider>);
}
const fill = (label, value) => fireEvent.change(screen.getByLabelText(label, { exact: true }), { target: { value } });
function completeForm() {
    fill('Player name', 'CardPlayer');
    fill('Email address', 'player@example.com');
    fill('Password', 'SafePass1!');
    fill('Confirm password', 'SafePass1!');
    fireEvent.click(screen.getByRole('checkbox'));
}
beforeEach(() => jest.clearAllMocks());

test('registration has no sign-in form; validation prevents bad submissions', async () => {
    mount();
    expect(screen.queryByRole('tab', { name: 'Sign in' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Choose a player name.');
    expect(registerAccount).not.toHaveBeenCalled();
    completeForm();
    fill('Confirm password', 'WrongPass1!');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Your passwords do not match.');
    expect(registerAccount).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(screen.getByLabelText('Password', { exact: true })).toHaveAttribute('type', 'text');
});

test('registration preserves inputs after failure, then confirms verification and returns to header sign-in', async () => {
    registerAccount.mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } }).mockResolvedValueOnce({ status: 200, data: {} });
    mount();
    completeForm();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Email already exists');
    expect(screen.getByLabelText('Email address')).toHaveValue('player@example.com');
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));
    await screen.findByText('Check your inbox');
    expect(registerAccount).toHaveBeenLastCalledWith({ sEmail: 'player@example.com', sUserName: 'CardPlayer', sPassword: 'SafePass1!' });
    fireEvent.click(screen.getByRole('button', { name: 'Return to the header to sign in' }));
    await screen.findByText('Destination: /lobby?signin=1');
});

test('existing-account link closes registration and sends players to the header', async () => {
    mount();
    fireEvent.click(screen.getByRole('link', { name: 'Use sign-in at the top' }));
    await screen.findByText('Destination: /lobby?signin=1');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('old login and email verification URLs redirect without rendering login controls', async () => {
    mount('/login?verificationStatus=success');
    await screen.findByText('Destination: /lobby?signin=1');
    expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
    expect(ReactToastify).toHaveBeenCalledWith(expect.stringContaining('verified'), 'success', 'verification');
});

test('account handoff saves the token and returns to the lobby', async () => {
    exchangeHandoff.mockResolvedValueOnce({ data: { data: { authorization: 'Bearer test-token' } } });
    mount('/login?handoffCode=test-code');
    await screen.findByText('Destination: /lobby');
    expect(exchangeHandoff).toHaveBeenCalledWith({ handoffCode: 'test-code' });
    expect(setCookie).toHaveBeenCalledWith('sAuthToken', 'test-token', 14);
});

test('failed handoff returns to header sign-in without losing navigation', async () => {
    exchangeHandoff.mockRejectedValueOnce(new Error('expired'));
    mount('/login?handoffCode=expired-code');
    await waitFor(() => expect(screen.getByText('Destination: /lobby?signin=1')).toBeInTheDocument());
    expect(setCookie).not.toHaveBeenCalled();
});
