/* global test, expect, beforeEach, afterEach */
import React from 'react';
import { createRoot } from 'react-dom/client';
import { act } from 'react-dom/test-utils';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { SiteThemeRuntime } from './SiteTheme';

let container;
let root;
beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
});
afterEach(() => { act(() => root.unmount()); container.remove(); });

function Harness() {
    const navigate = useNavigate();
    return <><SiteThemeRuntime /><button onClick={() => navigate('/game/table')}>Game</button><button onClick={() => navigate('/lobby')}>Lobby</button></>;
}

test('default app theme is removed on entry to gameplay and restored on exit', () => {
    act(() => root.render(<MemoryRouter initialEntries={['/lobby']}><Harness /></MemoryRouter>));
    expect(document.body.hasAttribute('data-site-theme')).toBe(true);
    expect(container.querySelector('style').textContent).toContain('#07152d');
    act(() => container.querySelectorAll('button')[0].click());
    expect(document.body.hasAttribute('data-site-theme')).toBe(false);
    expect(container.querySelector('style')).toBeNull();
    act(() => container.querySelectorAll('button')[1].click());
    expect(document.body.hasAttribute('data-site-theme')).toBe(true);
});

test('a direct gameplay link never mounts the app theme, even with saved colours', () => {
    localStorage.setItem('21holdem:site-theme:v1', JSON.stringify({ background: '#ffffff' }));
    act(() => root.render(<MemoryRouter initialEntries={['/game']}><Harness /></MemoryRouter>));
    expect(document.body.hasAttribute('data-site-theme')).toBe(false);
    expect(container.querySelector('style')).toBeNull();
});
