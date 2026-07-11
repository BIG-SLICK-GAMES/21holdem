/* global describe, test, expect */
import { buildGameActionState, getTurnCallAmount } from './gameActionState';

const formatAmount = (amount) => `#${amount}`;

describe('gameActionState', () => {
    test('uses min bet as call amount fallback', () => {
        expect(getTurnCallAmount(undefined, 250)).toBe(250);
        expect(getTurnCallAmount('500', 250)).toBe(500);
    });

    test('shows common turn actions with labels and amounts', () => {
        const state = buildGameActionState({
            aUserAction: ['f', 'c', 'r', 's', 'a', 'ck'],
            nMinBet: 100,
            toCallAmount: 250,
            myChips: 1200,
            maxRaiseAmount: 950,
            minRaise: 100,
            potAmount: 600,
            canStand: true,
            formatAmount,
        });

        expect(state.fold.visible).toBe(true);
        expect(state.call).toMatchObject({ visible: true, label: 'Call #250', bAllInMode: false });
        expect(state.raise.visible).toBe(true);
        expect(state.stand).toMatchObject({ visible: true, label: 'Call/Stand', bCallStandMode: true });
        expect(state.allInCommon).toMatchObject({ visible: true, amount: 1200 });
        expect(state.check.visible).toBe(true);
    });

    test('adds stand fallback when call exists without explicit stand action', () => {
        const state = buildGameActionState({
            aUserAction: ['c'],
            nMinBet: 100,
            toCallAmount: 100,
            canStand: true,
            formatAmount,
        });

        expect(state.stand).toMatchObject({ visible: true, label: 'Stand', bCallStandMode: true });
    });

    test('normalizes zero-call action to check for big blind with no raise', () => {
        const state = buildGameActionState({
            aUserAction: ['c', 'r', 'f'],
            nMinBet: 100,
            toCallAmount: 0,
            myChips: 1000,
            maxRaiseAmount: 900,
            minRaise: 100,
            canStand: true,
            formatAmount,
        });

        expect(state.call.visible).toBe(false);
        expect(state.check.visible).toBe(true);
        expect(state.raise.visible).toBe(true);
    });

    test('keeps raise available after checked player faces a raise before standing', () => {
        const state = buildGameActionState({
            aUserAction: ['c', 'r', 's'],
            nMinBet: 100,
            toCallAmount: 300,
            myChips: 1000,
            maxRaiseAmount: 700,
            minRaise: 100,
            potAmount: 500,
            canStand: true,
            hasRaiseSinceCheck: true,
            formatAmount,
        });

        expect(state.raisedAfterCheck).toBe(false);
        expect(state.call).toMatchObject({ visible: true, label: 'Call #300' });
        expect(state.raise.visible).toBe(true);
        expect(state.stand.visible).toBe(true);
    });

    test('blocks stand and raise after locked checked player faces a raise', () => {
        const state = buildGameActionState({
            aUserAction: ['c', 'r', 's'],
            nMinBet: 100,
            toCallAmount: 300,
            myChips: 1000,
            maxRaiseAmount: 700,
            minRaise: 100,
            potAmount: 500,
            canStand: true,
            hasRaiseSinceCheck: true,
            suppressStandAfterLocked: true,
            formatAmount,
        });

        expect(state.raisedAfterCheck).toBe(true);
        expect(state.call).toMatchObject({ visible: true, label: 'HIT' });
        expect(state.raise.visible).toBe(false);
        expect(state.stand.visible).toBe(false);
    });

    test('does not show stand again after the player has already stood and faces a call decision', () => {
        const state = buildGameActionState({
            aUserAction: ['f', 'c', 's'],
            nMinBet: 100,
            toCallAmount: 300,
            canStand: true,
            suppressStandAfterLocked: true,
            formatAmount,
        });

        expect(state.fold.visible).toBe(true);
        expect(state.call.visible).toBe(true);
        expect(state.stand.visible).toBe(false);
    });

    test('allows confirm label during all-in stand choice without blocking stand or raise', () => {
        const state = buildGameActionState({
            aUserAction: ['c', 'r', 's'],
            nMinBet: 100,
            toCallAmount: 300,
            myChips: 1000,
            maxRaiseAmount: 700,
            minRaise: 100,
            potAmount: 500,
            canStand: true,
            hasRaiseSinceCheck: true,
            bAllInStandChoice: true,
            formatAmount,
        });

        expect(state.raisedAfterCheck).toBe(false);
        expect(state.call).toMatchObject({ visible: true, label: 'HIT' });
        expect(state.raise.visible).toBe(true);
        expect(state.stand.visible).toBe(true);
    });

    test('only shows double down when allowed', () => {
        const hidden = buildGameActionState({ aUserAction: ['d'], canDoubleDown: false });
        const visible = buildGameActionState({ aUserAction: ['d'], canDoubleDown: true });

        expect(hidden.doubleDown).toMatchObject({ visible: false, enabled: false, alpha: 0.45 });
        expect(visible.doubleDown).toMatchObject({ visible: true, enabled: true, alpha: 1 });
    });
});
