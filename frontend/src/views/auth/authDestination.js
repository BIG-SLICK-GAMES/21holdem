export function getBigSlickGamesUrl() {
    const configuredUrl = process.env.REACT_APP_BSG_HOME_URL;
    if (configuredUrl) return configuredUrl.replace(/\/$/, '');

    if (typeof window === 'undefined') return '/';

    const currentUrl = new URL(window.location.href);
    const gameDevPorts = new Set(['3000', '3003', '3100']);

    if (gameDevPorts.has(currentUrl.port)) {
        currentUrl.port = '3200';
        currentUrl.pathname = '/';
        currentUrl.search = '';
        currentUrl.hash = '';
        return currentUrl.toString().replace(/\/$/, '');
    }

    return window.location.origin || '/';
}
