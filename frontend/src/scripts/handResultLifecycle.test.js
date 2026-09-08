/* global describe, test, expect */
import {
    createHandResultToken,
    HAND_RESULT_CLEAR_DELAY_MS,
    HAND_RESULT_REVEAL_DELAY_MS,
    isActiveHandResultToken,
    shouldShowNextRoundCountdown,
} from './handResultLifecycle';

describe('handResultLifecycle', () => {
    test('exports current result timing constants', () => {
        expect(HAND_RESULT_REVEAL_DELAY_MS).toBe(500);
        expect(HAND_RESULT_CLEAR_DELAY_MS).toBe(6600);
    });

    test('creates deterministic token when clock is injected', () => {
        expect(createHandResultToken(() => 12345)).toBe(12345);
    });

    test('validates only current visible hand result token', () => {
        expect(isActiveHandResultToken(10, 10, true)).toBe(true);
        expect(isActiveHandResultToken(11, 10, true)).toBe(false);
        expect(isActiveHandResultToken(10, 10, false)).toBe(false);
    });

    test('only shows the countdown for longer result windows', () => {
        expect(shouldShowNextRoundCountdown(6600)).toBe(false);
        expect(shouldShowNextRoundCountdown(4000)).toBe(false);
        expect(shouldShowNextRoundCountdown(8600)).toBe(true);
    });
});
