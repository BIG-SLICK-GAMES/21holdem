export const THEME_KEY = '21holdem:site-theme:v1';
export const THEME_EVENT = '21holdem:site-theme-change';
export const COLOURS = [
    ['background', 'Page background', '#030303'],
    ['surface', 'Panels and cards', '#17120d'],
    ['navigation', 'Top bar and navigation', '#090806'],
    ['button', 'Buttons', '#14110c'],
    ['accent', 'Active buttons and highlights', '#edbd61'],
    ['accentLight', 'Hover highlights', '#ffe6a1'],
    ['accentDark', 'Deep accent', '#c88b2c'],
    ['buttonText', 'Active button text', '#1b1005'],
    ['text', 'Main text', '#fff3d8'],
    ['muted', 'Secondary text', '#c9bca4'],
    ['border', 'Borders and dividers', '#826338'],
    ['field', 'Input fields', '#100d08'],
    ['bokeh', 'Bokeh lights', '#edbd61'],
    ['focus', 'Keyboard focus', '#ffe6a1'],
    ['success', 'Success', '#72c7a4'],
    ['danger', 'Errors', '#bb4858'],
];
export const DEFAULT_THEME = Object.fromEntries(COLOURS.map(([key, , value]) => [key, value]));
export const sanitizeTheme = input => Object.fromEntries(COLOURS.map(([key, , fallback]) =>
    [key, /^#[0-9a-f]{6}$/i.test(input?.[key]) ? input[key].toLowerCase() : fallback]));
export const isSiteThemeRoute = path => !/^\/game(?:\/|$)/i.test(path);
export function readTheme() {
    try { const saved = JSON.parse(localStorage.getItem(THEME_KEY)); return saved ? sanitizeTheme(saved) : null; }
    catch { return null; }
}
export function saveTheme(theme) {
    let saved = true;
    try { theme ? localStorage.setItem(THEME_KEY, JSON.stringify(sanitizeTheme(theme))) : localStorage.removeItem(THEME_KEY); }
    catch { saved = false; }
    window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: theme ? sanitizeTheme(theme) : null }));
    return saved;
}
const rgb = colour => [1, 3, 5].map(i => parseInt(colour.slice(i, i + 2), 16)).join(',');
export function themeCss(input) {
    const t = sanitizeTheme(input);
    const vars = {
        '--ui-blue': t.button, '--ui-blue-deep': t.background, '--ui-surface': t.surface,
        '--ui-text': t.text, '--ui-text-muted': t.muted, '--ui-gold': t.accent,
        '--ui-gold-light': t.accentLight, '--ui-gold-dark': t.accentDark,
        '--ui-gold-ink': t.buttonText, '--ui-border': t.border, '--ui-focus': t.focus,
        '--ui-danger': t.danger, '--ui-success': t.success,
        '--ui-gold-rgb': rgb(t.accent), '--ui-blue-rgb': rgb(t.button),
        '--ui-blue-deep-rgb': rgb(t.background), '--ui-silver-rgb': rgb(t.text),
        '--ui-blue-gradient': `linear-gradient(${t.button},${t.button})`,
        '--ui-gold-gradient': `linear-gradient(${t.accent},${t.accent})`,
        '--ui-surface-gradient': `linear-gradient(${t.surface},${t.surface})`,
        '--ui-border-gradient': `linear-gradient(${t.border},${t.border})`,
        '--site-navigation': t.navigation, '--site-field': t.field, '--site-bokeh-rgb': rgb(t.bokeh),
    };
    return `body[data-site-theme] {${Object.entries(vars).map(([k,v]) => `${k}:${v};`).join('')}}`;
}
