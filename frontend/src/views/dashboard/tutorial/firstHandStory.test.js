import { INITIAL_PLAYBACK, SCENES, READING_STOPS, currentReading, playbackReducer, handSnapshot } from './firstHandStory';

test('the Jack and each shared card produce valid totals, with a unique winner', () => {
  expect(handSnapshot(1, 6500).total).toBe(10);
  expect(handSnapshot(3, 2000).total).toBe(14);
  expect(handSnapshot(3, 6000).total).toBe(21);
  expect(handSnapshot(5, 8500).opponents.map(player => player.total)).toEqual([18, 19, 20]);
});
test('payout conserves the pot and player contribution', () => {
  const before = handSnapshot(5, 8500);
  for (const elapsed of [0, 1800, 2400, 3500, 7500]) {
    const result = handSnapshot(6, elapsed);
    expect(result.pot + result.balance).toBe(before.pot + before.balance);
  }
  expect(handSnapshot(6, 7500)).toMatchObject({ pot: 0, balance: 1060 });
});
test('manual movement pauses and clamps; replay clears scene and time', () => {
  let state = playbackReducer(INITIAL_PLAYBACK, { type: 'move', direction: -1 });
  expect(state.scene).toBe(0);
  state = playbackReducer(state, { type: 'move', direction: 1 });
  expect(state.playing).toBe(false);
  expect(playbackReducer(state, { type: 'tick', delta: 3000 })).toEqual(state);
  state = playbackReducer(state, { type: 'skip' });
  expect(state).toMatchObject({ scene: 6, playing: false, elapsed: SCENES[6].duration });
  state = playbackReducer(state, { type: 'replay' });
  expect(state).toEqual({ ...INITIAL_PLAYBACK, generation: 1 });
});
test('every teaching checkpoint holds indefinitely until explicitly continued', () => {
  let state = INITIAL_PLAYBACK;
  const seen = [];
  for (let guard = 0; guard < 40; guard++) {
    state = playbackReducer(state, { type: 'tick', delta: 20000 });
    if (state.reading) {
      seen.push(currentReading(state).id);
      expect(playbackReducer(state, { type: 'tick', delta: 60000 })).toEqual(state);
      state = playbackReducer(state, { type: 'toggle' });
    } else if (!state.playing) break;
  }
  expect(seen).toEqual(READING_STOPS.flat().map(stop => stop.id));
  expect(state).toMatchObject({ scene: 6, playing: false });
  expect(playbackReducer(state, { type: 'move', direction: 1 }).scene).toBe(6);
});
test('reduced-motion Continue visits each explanation without running a clock', () => {
  let state = playbackReducer(INITIAL_PLAYBACK, { type: 'checkpoint' });
  const seen = [];
  while (state.reading) {
    seen.push(currentReading(state).id);
    state = playbackReducer(state, { type: 'toggle', reducedMotion: true });
    expect(state.playing).toBe(false);
  }
  expect(seen).toEqual(READING_STOPS.flat().map(stop => stop.id));
});
