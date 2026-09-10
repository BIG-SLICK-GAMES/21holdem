// A presentation only: never sends game actions or modifies a real table.
export const SCENES = [
  { title: 'Take your seat', duration: 6500, lines: ['Welcome to 21 Hold\u2019em.', 'Blackjack scoring. Poker pressure.'] },
  { title: 'Your private card', duration: 6500, lines: ['You start with one private hole card.', 'Face cards are worth 10.'] },
  { title: 'The betting begins', duration: 10000, lines: ['Bet against the table.', 'Fold, call or raise when the pressure builds.'] },
  { title: 'Follow the board', duration: 10000, lines: ['Community cards change every unlocked hand.', 'Your total: 10\u2026 14\u2026 21.'] },
  { title: 'Hit, Stand or Double Down', duration: 15000, lines: ['Keep taking community cards\u2014or lock your total.', 'Double Down early for a second private card and extra pressure.'] },
  { title: 'Showdown', duration: 8500, lines: ['Closest to 21 without going bust wins.', 'You have 21.'] },
  { title: 'Win the pot', duration: 7500, lines: ['Perfect 21.', 'The pot is yours.'] },
];

export const INITIAL_PLAYBACK = { scene: 0, elapsed: 0, playing: true, generation: 0 };
export function playbackReducer(state, action) {
  switch (action.type) {
    case 'tick': {
      if (!state.playing) return state;
      const elapsed = state.elapsed + action.delta;
      if (elapsed < SCENES[state.scene].duration) return { ...state, elapsed };
      if (state.scene === 6) return { ...state, elapsed: SCENES[6].duration, playing: false };
      return { ...state, scene: state.scene + 1, elapsed: 0 };
    }
    case 'move': return { ...state, scene: Math.max(0, Math.min(6, state.scene + action.direction)), elapsed: SCENES[Math.max(0, Math.min(6, state.scene + action.direction))].duration, playing: false };
    case 'toggle': return { ...state, playing: !state.playing, elapsed: !state.playing && state.elapsed >= SCENES[state.scene].duration ? 0 : state.elapsed };
    case 'pause': return { ...state, playing: false };
    case 'replay': return { ...INITIAL_PLAYBACK, generation: state.generation + 1, playing: action.playing !== false };
    case 'skip': return { ...state, scene: 6, elapsed: SCENES[6].duration, playing: false };
    default: return state;
  }
}

export const fraction = (time, start, duration) => Math.max(0, Math.min(1, (time - start) / duration));
export function handSnapshot(scene, elapsed) {
  const boardCount = scene < 3 ? 0 : scene > 3 ? 2 : (elapsed >= 5500 ? 2 : elapsed >= 1600 ? 1 : 0);
  const board = [4, 7].slice(0, boardCount);
  const total = scene === 0 ? 0 : 10 + board.reduce((sum, card) => sum + card, 0);
  // Four equal contributions of 20: 80-chip demonstration pot, no rake/all-in.
  const pot = scene < 2 ? 15 : scene === 2 ? 15 + Math.round(65 * fraction(elapsed, 600, 6800)) : scene === 6 ? Math.round(80 * (1 - fraction(elapsed, 1800, 1700))) : 80;
  const balance = scene < 2 ? 1000 : scene === 2 ? 1000 - Math.round(20 * fraction(elapsed, 600, 6800)) : scene === 6 ? 980 + Math.round(80 * fraction(elapsed, 1800, 1700)) : 980;
  return { board, total, pot, balance, opponents: [7, 8, 9].map(card => ({ card, total: card + board.reduce((sum, value) => sum + value, 0) })) };
}
