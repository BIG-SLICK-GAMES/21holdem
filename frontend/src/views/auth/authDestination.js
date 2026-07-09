export function getBigSlickGamesUrl() {
    const configuredUrl = process.env.REACT_APP_BSG_HOME_URL;
    if (configuredUrl) return configuredUrl.replace(/\/$/, '');

    if (typeof window === 'undefined') return '/';

    return window.location.origin || '/';
}
