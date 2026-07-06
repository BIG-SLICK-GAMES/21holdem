const BIG_SLICK_GAMES_FALLBACK_PORT = '3200';

export function getBigSlickGamesUrl() {
    const configuredUrl = process.env.REACT_APP_BSG_HOME_URL;
    if (configuredUrl) return configuredUrl;

    if (typeof window === 'undefined') return '/';

    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:${BIG_SLICK_GAMES_FALLBACK_PORT}`;
}
