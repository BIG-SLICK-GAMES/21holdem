/* global test, expect */
import { sanitizeTexture, textureImage, textureCss, saveTexture, readTexture, TEXTURE_KEY, texturePaint } from './siteTexture';
import { THEME_PRESETS } from './siteThemePresets';
import { sanitizeTheme } from './siteTheme';
test('texture settings clamp intensity and reject unknown patterns', () => {
    expect(sanitizeTexture({ pattern: 'stripes', intensity: 200 })).toMatchObject({ layers: { stripes: { enabled: true, opacity: 25, scale: 100 } } });
    expect(textureImage({ pattern: 'url(https://invalid)', intensity: 50 })).toBe('none');
    expect(textureCss({ pattern: 'dimples', intensity: 40 })).toContain('body[data-site-theme]');
});
test('all ten presets provide valid complete colour palettes', () => {
    expect(THEME_PRESETS).toHaveLength(10);
    expect(new Set(THEME_PRESETS.map(p => p.id)).size).toBe(10);
    THEME_PRESETS.forEach(p => expect(sanitizeTheme(p.colours)).toEqual(p.colours));
});

test('saved background survives a fresh read and restores the same paint variables', () => {
    const choice = { pattern: 'diamonds', intensity: 67 };
    expect(saveTexture(choice)).toBe(true);
    expect(readTexture()).toEqual(sanitizeTexture(choice));
    expect(textureCss(readTexture())).toBe(textureCss(choice));
    expect(textureCss(choice)).toContain('--site-texture-image:repeating-linear-gradient');
    expect(textureCss(choice)).not.toContain('background:');
    localStorage.removeItem(TEXTURE_KEY);
});

test('multiple patterns keep independent opacity and tile size after saving', () => {
    const value = { layers: {
        stripes: { enabled: true, opacity: 12, scale: 50 },
        diamonds: { enabled: false, opacity: 30, scale: 200 },
        dimples: { enabled: true, opacity: 40, scale: 150 },
    } };
    saveTexture(value);
    expect(readTexture()).toEqual(value);
    const paint = texturePaint(readTexture());
    expect(paint.size).toBe('auto,27px 27px,27px 27px');
    expect(paint.image).toContain('0.12');
    expect(paint.image).toContain('0.4');
    expect(paint.image).not.toContain('45deg');
    localStorage.removeItem(TEXTURE_KEY);
});
