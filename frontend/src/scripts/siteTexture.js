export const TEXTURE_KEY = '21holdem:site-texture:v1';
export const TEXTURE_EVENT = '21holdem:site-texture-change';
export const TEXTURES = [ ['bokeh', 'Bokeh'], ['mesh', 'Industrial mesh'], ['stripes', 'Stripes'], ['diamonds', 'Diamonds'], ['dimples', 'Dimples'] ];
const clamp = (value, fallback, min, max) => Number.isFinite(Number(value)) ? Math.max(min, Math.min(max, Number(value))) : fallback;
export const sanitizeTexture = input => ({ layers: Object.fromEntries(TEXTURES.map(([key]) => {
    const layer = input?.layers?.[key];
    return [key, {
        enabled: layer ? layer.enabled === true : input?.pattern === key,
        opacity: layer ? clamp(layer.opacity, key === 'bokeh' ? 45 : 20, 0, 100) : (input?.pattern === key ? clamp(input.intensity, 35, 0, 100) / 4 : key === 'bokeh' ? 45 : 20),
        scale: layer ? clamp(layer.scale, 100, 25, 400) : 100,
    }];
})) });
export const DEFAULT_TEXTURE = sanitizeTexture(null);
export const hasTexture = value => Object.values(sanitizeTexture(value).layers).some(layer => layer.enabled);
export function readTexture() {
    try { const saved = JSON.parse(localStorage.getItem(TEXTURE_KEY)); return saved ? sanitizeTexture(saved) : DEFAULT_TEXTURE; } catch { return DEFAULT_TEXTURE; }
}
export function saveTexture(value) {
    const next = sanitizeTexture(value);
    let saved = true;
    try { localStorage.setItem(TEXTURE_KEY, JSON.stringify(next)); } catch { saved = false; }
    window.dispatchEvent(new CustomEvent(TEXTURE_EVENT, { detail: next }));
    return saved;
}
export function texturePaint(value) {
    const { layers } = sanitizeTexture(value);
    const images = [], sizes = [];
    for (const [pattern] of TEXTURES) {
        const layer = layers[pattern];
        if (!layer.enabled) continue;
        const px = n => `${Number((n * layer.scale / 100).toFixed(2))}px`;
        const light = `rgba(var(--ui-silver-rgb),${layer.opacity / 100})`;
        const shade = `rgba(0,0,0,${Math.min(1, layer.opacity / 50)})`;
        if (pattern === 'bokeh') {
            const glow = `rgba(var(--site-bokeh-rgb, var(--ui-gold-rgb)),${layer.opacity / 100})`;
            const haze = `rgba(var(--site-bokeh-rgb, var(--ui-gold-rgb)),${layer.opacity / 250})`;
            for (const [x, y, radius, width, height] of [[18, 26, 54, 620, 510], [73, 68, 82, 830, 690], [42, 85, 35, 470, 730], [88, 14, 62, 970, 570]]) {
                images.push(`radial-gradient(circle at ${x}% ${y}%,${glow} 0 ${px(radius * .35)},${haze} ${px(radius * .75)},transparent ${px(radius * 1.2)})`);
                sizes.push(`${px(width)} ${px(height)}`);
            }
        }
        if (pattern === 'mesh') {
            images.push(`radial-gradient(ellipse at 50% 45%,rgba(0,0,0,.65) 0 30%,${light} 39%,transparent 52%)`);
            sizes.push(`${px(7)} ${px(5)}`);
            for (const angle of [45, -45]) {
                images.push(`repeating-linear-gradient(${angle}deg,transparent 0 ${px(4)},${light} ${px(4)} ${px(4.5)},transparent ${px(4.5)} ${px(8)})`);
                sizes.push('auto');
            }
        }
        if (pattern === 'stripes') {
            images.push(`repeating-linear-gradient(135deg,transparent 0 ${px(12)},${light} ${px(12)} ${px(14)},transparent ${px(14)} ${px(26)})`);
            sizes.push('auto');
        }
        if (pattern === 'diamonds') {
            for (const angle of [45, -45]) {
                images.push(`repeating-linear-gradient(${angle}deg,transparent 0 ${px(23)},${light} ${px(23)} ${px(24)},transparent ${px(24)} ${px(48)})`);
                sizes.push('auto');
            }
        }
        if (pattern === 'dimples') {
            images.push(`radial-gradient(circle at ${px(8)} ${px(7)},${shade} 0 ${px(3)},transparent ${px(5)})`);
            images.push(`radial-gradient(circle at ${px(8)} ${px(10)},${light} 0 ${px(3)},transparent ${px(5)})`);
            sizes.push(`${px(18)} ${px(18)}`, `${px(18)} ${px(18)}`);
        }
    }
    return { image: images.join(',') || 'none', size: sizes.join(',') || 'auto' };
}
export const textureImage = value => texturePaint(value).image;
export function textureCss(value) {
    const { layers } = sanitizeTexture(value);
    const paint = texturePaint({ layers: { ...layers, bokeh: { ...layers.bokeh, enabled: false } } });
    const bokeh = texturePaint({ layers: { bokeh: layers.bokeh } });
    return `body[data-site-theme] {--site-texture-image:${paint.image};--site-texture-size:${paint.size};--site-bokeh-image:${bokeh.image};--site-bokeh-size:${bokeh.size};--site-bokeh-display:${layers.bokeh.enabled ? 'block' : 'none'};}`;
}
