import { THEME_PRESETS } from '../../scripts/siteThemePresets';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COLOURS, DEFAULT_THEME, THEME_EVENT, THEME_KEY, isSiteThemeRoute, readTheme, saveTheme, themeCss } from '../../scripts/siteTheme';

export function SiteThemeRuntime() {
    const { pathname } = useLocation();
    const [theme, setTheme] = useState(readTheme);
    useEffect(() => {
        const change = event => setTheme(event.detail);
        const storage = event => { if (event.key === THEME_KEY || event.key === null) setTheme(readTheme()); };
        window.addEventListener(THEME_EVENT, change);
        window.addEventListener('storage', storage);
        return () => { window.removeEventListener(THEME_EVENT, change); window.removeEventListener('storage', storage); };
    }, []);
    const enabled = Boolean(theme) && isSiteThemeRoute(pathname);
    useLayoutEffect(() => {
        if (enabled) document.body.setAttribute('data-site-theme', 'custom');
        else document.body.removeAttribute('data-site-theme');
        return () => document.body.removeAttribute('data-site-theme');
    }, [enabled]);
    return enabled ? <style>{themeCss(theme)}</style> : null;
}

export default function ThemeAdjuster() {
    const [theme, setTheme] = useState(() => readTheme() || DEFAULT_THEME);
    const [status, setStatus] = useState('Changes preview live and save on this device.');
    const update = (key, value) => {
        const next = { ...theme, [key]: value };
        setTheme(next);
        setStatus(saveTheme(next) ? 'Saved on this device' : 'Preview only: browser storage is unavailable');
    };
    const activePreset = THEME_PRESETS.find(preset => COLOURS.every(([key]) => theme[key] === preset.colours[key]));
    const applyPreset = preset => {
        const next = { ...preset.colours };
        setTheme(next);
        setStatus(saveTheme(next) ? `${preset.name} saved on this device` : 'Preview only: browser storage is unavailable');
    };
    const reset = () => { setTheme(DEFAULT_THEME); saveTheme(null); setStatus('Original site theme restored'); };
    const copy = async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(theme, null, 2)); setStatus('Theme values copied'); }
        catch { setStatus('Copy unavailable. Your colour values are shown below.'); }
    };
    return <section className='site-theme-editor'>
        <p>Customise the site colours. In-game colours and artwork stay unchanged.</p>
        <h2>Presets</h2>
        <div className='site-theme-editor__presets' role='group' aria-label='Theme presets'>
            {THEME_PRESETS.map(preset => <button type='button' className='site-theme-editor__preset' key={preset.id}
                aria-pressed={activePreset?.id === preset.id} onClick={() => applyPreset(preset)}>
                <span className='site-theme-editor__swatches' aria-hidden='true'>
                    {['background', 'surface', 'accent', 'text'].map(key => <i key={key} style={{ backgroundColor: preset.colours[key] }} />)}
                </span>
                <span>{preset.name}</span>
            </button>)}
        </div>
        <p>Current theme: {activePreset?.name || 'Custom'}. You can fine-tune any colour below.</p>
        <div className='site-theme-editor__colours'>
            {COLOURS.map(([key, label]) => <label className='site-theme-editor__colour' key={key}>
                <span>{label}</span>
                <input type='color' aria-label={label} value={theme[key]} onChange={event => update(key, event.target.value)} />
                <span>{theme[key]}</span>
            </label>)}
        </div>
        <div className='site-theme-editor__actions'>
            <button type='button' className='dashboard-hub__signin-button' onClick={copy}>Copy Values</button>
            <button type='button' className='dashboard-hub__signin-button' onClick={reset}>Reset Theme</button>
        </div>
        <p role='status'>{status}</p>
    </section>;
}
