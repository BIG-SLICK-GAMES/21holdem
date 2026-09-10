import { DEFAULT_TEXTURE, TEXTURES, TEXTURE_KEY, TEXTURE_EVENT, readTexture, saveTexture, textureCss, texturePaint, hasTexture } from '../../scripts/siteTexture';
import { THEME_PRESETS } from '../../scripts/siteThemePresets';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COLOURS, DEFAULT_THEME, THEME_EVENT, THEME_KEY, isSiteThemeRoute, readTheme, saveTheme, themeCss } from '../../scripts/siteTheme';

export function SiteThemeRuntime() {
    const { pathname } = useLocation();
    const [theme, setTheme] = useState(readTheme);
    const [texture, setTexture] = useState(readTexture);
    useEffect(() => {
        const change = event => setTexture(event.detail);
        const storage = event => { if (event.key === TEXTURE_KEY || event.key === null) setTexture(readTexture()); };
        window.addEventListener(TEXTURE_EVENT, change); window.addEventListener('storage', storage);
        return () => { window.removeEventListener(TEXTURE_EVENT, change); window.removeEventListener('storage', storage); };
    }, []);
    useEffect(() => {
        const change = event => setTheme(event.detail);
        const storage = event => { if (event.key === THEME_KEY || event.key === null) setTheme(readTheme()); };
        window.addEventListener(THEME_EVENT, change);
        window.addEventListener('storage', storage);
        return () => { window.removeEventListener(THEME_EVENT, change); window.removeEventListener('storage', storage); };
    }, []);
    const enabled = (Boolean(theme) || hasTexture(texture)) && isSiteThemeRoute(pathname);
    useLayoutEffect(() => {
        if (enabled) document.body.setAttribute('data-site-theme', 'custom');
        else document.body.removeAttribute('data-site-theme');
        return () => document.body.removeAttribute('data-site-theme');
    }, [enabled]);
    return enabled ? <style>{themeCss(theme || DEFAULT_THEME) + (hasTexture(texture) ? textureCss(texture) : '')}</style> : null;
}

export default function ThemeAdjuster() {
    const [theme, setTheme] = useState(() => readTheme() || DEFAULT_THEME);
    const [texture, setTexture] = useState(readTexture);
    const updateTexture = next => { setTexture(next); setStatus(saveTexture(next) ? 'Texture saved on this device' : 'Preview only: browser storage is unavailable'); };
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
    const reset = () => { setTheme(DEFAULT_THEME); saveTheme(null); setTexture(DEFAULT_TEXTURE); saveTexture(DEFAULT_TEXTURE); setStatus('Original site theme restored'); };
    const copy = async () => {
        try { await navigator.clipboard.writeText(JSON.stringify({ ...theme, texture }, null, 2)); setStatus('Theme values copied'); }
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
        <h2>Background textures</h2>
        <p>Select any combination. Adjust each pattern independently.</p>
        <button type='button' className='dashboard-hub__signin-button' onClick={() => updateTexture({ layers: Object.fromEntries(Object.entries(texture.layers).map(([key, layer]) => [key, { ...layer, enabled: false }])) })}>Plain background</button>
        <div className='site-theme-editor__presets' role='group' aria-label='Background textures'>
            {TEXTURES.map(([pattern, label]) => {
                const layer = texture.layers[pattern];
                const changeLayer = patch => updateTexture({ layers: { ...texture.layers, [pattern]: { ...layer, ...patch } } });
                const sample = texturePaint({ layers: { [pattern]: { ...layer, enabled: true } } });
                return <div className='site-theme-editor__texture-layer' key={pattern}>
                    <button type='button' className='site-theme-editor__preset' aria-pressed={layer.enabled} onClick={() => changeLayer({ enabled: !layer.enabled })}>
                        <span className='site-theme-editor__texture-sample' aria-hidden='true' style={{ backgroundImage: sample.image, backgroundSize: sample.size }} />
                        <span>{label}{layer.enabled ? ' (selected)' : ''}</span>
                    </button>
                    <label className='site-theme-editor__layer-control'>{label} opacity: {layer.opacity}%
                        <input type='range' min='0' max='100' step='0.25' value={layer.opacity} disabled={!layer.enabled} onChange={event => changeLayer({ opacity: Number(event.target.value) })} />
                    </label>
                    <label className='site-theme-editor__layer-control'>{label} tile size: {layer.scale}%
                        <input type='range' min='25' max='400' step='5' value={layer.scale} disabled={!layer.enabled} onChange={event => changeLayer({ scale: Number(event.target.value) })} />
                    </label>
                </div>;
            })}
        </div>
        <h2>Fine-tune colours</h2>
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
