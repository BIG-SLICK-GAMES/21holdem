const DEFAULT_BSG_HOME_URL = 'https://bigslickgames.com';

export function getBigSlickGamesUrl() {
    return process.env.REACT_APP_BSG_HOME_URL || DEFAULT_BSG_HOME_URL;
}
