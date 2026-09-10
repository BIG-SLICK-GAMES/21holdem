/* global test, expect */
import { sanitizeTexture, textureImage, textureCss } from './siteTexture';
import { THEME_PRESETS } from './siteThemePresets';
import { sanitizeTheme } from './siteTheme';
test('texture settings clamp intensity and reject unknown patterns', () => {
    expect(sanitizeTexture({ pattern: 'stripes', intensity: 200 })).toEqual({ pattern: 'stripes', intensity: 100 });
    expect(textureImage({ pattern: 'url(https://invalid)', intensity: 50 })).toBe('none');
    expect(textureCss({ pattern: 'dimples', intensity: 40 })).toContain('body[data-site-theme]');
});
test('all ten presets provide valid complete colour palettes', () => {
    expect(THEME_PRESETS).toHaveLength(10);
    expect(new Set(THEME_PRESETS.map(p => p.id)).size).toBe(10);
    THEME_PRESETS.forEach(p => expect(sanitizeTheme(p.colours)).toEqual(p.colours));
});
