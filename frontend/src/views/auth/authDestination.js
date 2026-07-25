const DEFAULT_BSG_HOME_URL = 'https://bigslickgames.com';

export function getBigSlickGamesUrl() {
    const configuredUrl = process.env.REACT_APP_BSG_HOME_URL;
    if (configuredUrl) return configuredUrl.replace(/\/$/, '');

    if (typeof window === 'undefined') return DEFAULT_BSG_HOME_URL;

    return DEFAULT_BSG_HOME_URL;
}
