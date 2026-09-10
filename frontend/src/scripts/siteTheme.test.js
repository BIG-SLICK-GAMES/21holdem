/* global test, expect */
import { isSiteThemeRoute, sanitizeTheme, DEFAULT_THEME, themeCss } from './siteTheme';
test('custom site theme never applies to gameplay routes', () => {
    expect(isSiteThemeRoute('/game')).toBe(false);
    expect(isSiteThemeRoute('/game/')).toBe(false);
    expect(isSiteThemeRoute('/game/table')).toBe(false);
    expect(isSiteThemeRoute('/settings/theme')).toBe(true);
    expect(isSiteThemeRoute('/lobby')).toBe(true);
});
test('rejects invalid colours and injected CSS', () => {
    expect(sanitizeTheme({ accent: '#AABBCC', text: 'red; } body { display:none' })).toEqual({ ...DEFAULT_THEME, accent: '#aabbcc' });
    expect(themeCss({ text: '</style><script>' })).not.toContain('<script>');
    expect(themeCss(DEFAULT_THEME)).toMatch(/^body\[data-site-theme\]/);
});
