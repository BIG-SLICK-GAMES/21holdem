import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const KEY = '21holdem:background-layout:v1';
const DEFAULTS = { scale: 100, width: 100, height: 100, x: 0, y: 0 };
const CONTROLS = [
    { key: 'scale', label: 'Scale (%)', min: 25, max: 300 },
    { key: 'width', label: 'Width (%)', min: 25, max: 300 },
    { key: 'height', label: 'Height (%)', min: 25, max: 300 },
    { key: 'x', label: 'Horizontal position (px)', min: -1200, max: 1200 },
    { key: 'y', label: 'Vertical position (px)', min: -1200, max: 1200 },
];
const sanitize = (value) => Object.fromEntries(CONTROLS.map(({ key, min, max }) => {
    const n = Number(value?.[key]);
    return [key, Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : DEFAULTS[key]];
}));
const read = () => { try { return sanitize(JSON.parse(localStorage.getItem(KEY)) || DEFAULTS); } catch { return DEFAULTS; } };

export default function GameBackgroundAdjuster() {
    const [open, setOpen] = useState(false);
    const [values, setValues] = useState(read);
    const [status, setStatus] = useState('');
    useEffect(() => {
        const style = document.documentElement.style;
        style.setProperty('--game-bg-scale-x', values.scale * values.width / 10000);
        style.setProperty('--game-bg-scale-y', values.scale * values.height / 10000);
        style.setProperty('--game-bg-x', `${values.x}px`);
        style.setProperty('--game-bg-y', `${values.y}px`);
        try { localStorage.setItem(KEY, JSON.stringify(values)); setStatus('Saved on this device'); }
        catch { setStatus('Applied for this visit'); }
        return () => ['--game-bg-scale-x', '--game-bg-scale-y', '--game-bg-x', '--game-bg-y'].forEach(key => style.removeProperty(key));
    }, [values]);
    const copy = async () => {
        try { await navigator.clipboard.writeText(JSON.stringify(values, null, 2)); setStatus('Values copied'); }
        catch { setStatus('Copy unavailable. Values are shown in the controls.'); }
    };
    return createPortal(
        <div className='game-bg-adjuster' onKeyDown={event => { if (event.key === 'Escape') setOpen(false); }}>
            <button type='button' className='game-bg-adjuster__toggle' aria-expanded={open} aria-controls='game-bg-panel' onClick={() => setOpen(!open)}>
                {open ? 'Close BG adjuster' : 'BG Adjuster'}
            </button>
            {open && <section id='game-bg-panel' className='game-bg-adjuster__panel' aria-label='Background adjuster'>
                <h2>Background</h2>
                {CONTROLS.map(control => <div className='game-bg-adjuster__control' key={control.key}>
                    <label htmlFor={`bg-${control.key}`}>{control.label}</label>
                    <input id={`bg-${control.key}`} type='number' min={control.min} max={control.max} step='1' value={values[control.key]}
                        onChange={event => setValues(sanitize({ ...values, [control.key]: event.target.value }))} />
                    <input type='range' aria-label={control.label} min={control.min} max={control.max} step='1' value={values[control.key]}
                        onChange={event => setValues(sanitize({ ...values, [control.key]: event.target.value }))} />
                </div>)}
                <div className='game-bg-adjuster__actions'>
                    <button type='button' onClick={() => setValues({ ...DEFAULTS })}>Reset</button>
                    <button type='button' onClick={copy}>Copy Values</button>
                </div>
                <p role='status'>{status}</p>
            </section>}
        </div>, document.body
    );
}
