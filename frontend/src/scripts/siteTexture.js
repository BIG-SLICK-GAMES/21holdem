export const TEXTURE_KEY = '21holdem:site-texture:v1';
export const TEXTURE_EVENT = '21holdem:site-texture-change';
export const TEXTURES = [ ['none', 'Plain'], ['stripes', 'Stripes'], ['diamonds', 'Diamonds'], ['dimples', 'Dimples'] ];
export const DEFAULT_TEXTURE = { pattern: 'none', intensity: 35 };
export const sanitizeTexture = input => ({
    pattern: TEXTURES.some(([key]) => key === input?.pattern) ? input.pattern : 'none',
    intensity: Number.isFinite(Number(input?.intensity)) ? Math.max(0, Math.min(100, Number(input.intensity))) : 35,
});
export function readTexture() {
    try { return sanitizeTexture(JSON.parse(localStorage.getItem(TEXTURE_KEY))); } catch { return DEFAULT_TEXTURE; }
}
export function saveTexture(value) {
    const next = sanitizeTexture(value);
    let saved = true;
    try { localStorage.setItem(TEXTURE_KEY, JSON.stringify(next)); } catch { saved = false; }
    window.dispatchEvent(new CustomEvent(TEXTURE_EVENT, { detail: next }));
    return saved;
}
export function textureImage(value) {
    const { pattern, intensity } = sanitizeTexture(value);
    const light = `rgba(var(--ui-silver-rgb),${intensity * .0025})`;
    const shade = `rgba(0,0,0,${intensity * .005})`;
    if (pattern === 'stripes') return `repeating-linear-gradient(135deg,transparent 0 12px,${light} 12px 14px,transparent 14px 26px)`;
    if (pattern === 'diamonds') return `repeating-linear-gradient(45deg,transparent 0 23px,${light} 23px 24px,transparent 24px 48px),repeating-linear-gradient(-45deg,transparent 0 23px,${light} 23px 24px,transparent 24px 48px)`;
    if (pattern === 'dimples') return `radial-gradient(circle at 8px 7px,${shade} 0 3px,transparent 5px),radial-gradient(circle at 8px 10px,${light} 0 3px,transparent 5px)`;
    return 'none';
}
export function textureCss(value) {
    const t = sanitizeTexture(value);
    return `body[data-site-theme] :is(.main-layout:not(.gameplay-layout), .auth-layout, .common-layout) {background-image:${textureImage(t)} !important;background-size:${t.pattern === 'dimples' ? '18px 18px' : 'auto'} !important;}body[data-site-theme] :is(.main-layout:not(.gameplay-layout) .main-layout-background, .dashboard-hub--themed-scene) {background:transparent !important;}`;
}
