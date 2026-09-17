/* global test, expect */
import { sanitizeTexture, textureImage, textureCss, saveTexture, readTexture, TEXTURE_KEY, texturePaint } from './siteTexture';
import { THEME_PRESETS } from './siteThemePresets';
import { sanitizeTheme } from './siteTheme';
test('texture settings clamp intensity and reject unknown patterns', () => {
    expect(sanitizeTexture({ pattern: 'stripes', intensity: 200 })).toMatchObject({ layers: { stripes: { enabled: true, opacity: 25, scale: 100 } } });
    expect(textureImage({ pattern: 'url(https://invalid)', intensity: 50 })).toBe('none');
    expect(textureCss({ pattern: 'dimples', intensity: 40 })).toContain('body[data-site-theme]');
});
test('all presets provide valid complete colour palettes with unique IDs', () => {
    expect(THEME_PRESETS.length).toBeGreaterThan(0);
    expect(new Set(THEME_PRESETS.map(p => p.id)).size).toBe(THEME_PRESETS.length);
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
    expect(readTexture()).toEqual(sanitizeTexture(value));
    const paint = texturePaint(readTexture());
    expect(paint.size).toBe('auto,27px 27px,27px 27px');
    expect(paint.image).toContain('0.12');
    expect(paint.image).toContain('0.4');
    expect(paint.image).not.toContain('45deg');
    localStorage.removeItem(TEXTURE_KEY);
});

test('fresh installs use plain backgrounds and preserve saved choices', () => {
    localStorage.removeItem(TEXTURE_KEY);
    expect(textureImage(readTexture())).toBe('none');
    saveTexture({ layers: { mesh: { enabled: true, opacity: 12, scale: 100 } } });
    expect(readTexture().layers.mesh.enabled).toBe(true);
    saveTexture({ layers: {} });
    expect(textureImage(readTexture())).toBe('none');
    localStorage.removeItem(TEXTURE_KEY);
});

test('Bokeh is a persistent background effect with adjustable size and opacity', () => {
    saveTexture({ layers: { bokeh: { enabled: true, opacity: 45, scale: 150 } } });
    const paint = texturePaint(readTexture());
    expect(paint.image.match(/radial-gradient/g)).toHaveLength(4);
    expect(paint.image).toContain('--site-bokeh-rgb');
    expect(paint.image).toContain('0.45');
    expect(paint.size).toContain('930px 765px');
    expect(textureCss(readTexture())).toContain('--site-texture-image:none;');
    expect(textureCss(readTexture())).toContain('--site-bokeh-image:radial-gradient');
    expect(textureCss(readTexture())).toContain('--site-bokeh-display:block;');
    saveTexture({ layers: {} });
    expect(textureImage(readTexture())).toBe('none');
    expect(textureCss(readTexture())).toContain('--site-bokeh-display:none;');
    localStorage.removeItem(TEXTURE_KEY);
});
