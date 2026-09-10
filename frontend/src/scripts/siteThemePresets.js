import { DEFAULT_THEME } from './siteTheme';

const palette = (background, surface, accent, accentLight, accentDark, text, muted, border) => ({
    ...DEFAULT_THEME, background, surface, navigation: background, button: surface,
    accent, accentLight, accentDark, buttonText: background, text, muted, border,
    field: background, bokeh: accent, focus: accentLight,
});
export const THEME_PRESETS = [
    { id: 'black-gold', name: 'Black & Gold', colours: { ...DEFAULT_THEME } },
    { id: 'midnight', name: 'Midnight Blue', colours: palette('#060c1a', '#12233e', '#86baff', '#c4ddff', '#4776b8', '#edf4ff', '#b0bed4', '#3e608a') },
    { id: 'emerald', name: 'Emerald', colours: palette('#04120e', '#102b21', '#64dca9', '#b6f3d8', '#329269', '#edfff6', '#afcdbf', '#3e7861') },
    { id: 'ruby', name: 'Ruby', colours: palette('#17070b', '#32141d', '#ff8299', '#ffc4cf', '#b34b63', '#fff0f3', '#d1b0b8', '#844554') },
    { id: 'amethyst', name: 'Amethyst', colours: palette('#100919', '#241735', '#c5a0ff', '#e6d3ff', '#8861bb', '#f7f0ff', '#c2b2d4', '#70548d') },
    { id: 'rose', name: 'Rose Gold', colours: palette('#160e10', '#302025', '#edb1a6', '#ffdad1', '#b57670', '#fff2ee', '#d0b7b4', '#88645e') },
    { id: 'copper', name: 'Copper', colours: palette('#160d07', '#302013', '#f0ac72', '#ffd5ac', '#ae703b', '#fff4e7', '#cfbba3', '#89623d') },
    { id: 'ocean', name: 'Ocean', colours: palette('#041216', '#102b33', '#72d8ed', '#bbf3ff', '#3796aa', '#edfcff', '#aecbd1', '#3c7480') },
    { id: 'platinum', name: 'Platinum', colours: palette('#0c0d10', '#202329', '#c8d2e0', '#f0f4fa', '#8793a3', '#f3f5f8', '#b9bec8', '#666f7d') },
    { id: 'forest', name: 'Forest Gold', colours: palette('#0c1208', '#202a18', '#cfdb86', '#edf4b8', '#8a994a', '#f7fbe8', '#c1c9ac', '#697b43') },
];
