import { getPlayerActionLabel } from './actionControls';
import { SOCKET_RESPONSE_EVENTS } from '../../scripts/socketEvents';

describe('actionControls', () => {
    test('shows the explicit raise increment instead of the player chip stack', () => {
        expect(getPlayerActionLabel({
            sEventName: SOCKET_RESPONSE_EVENTS.RAISE,
            oData: {
                nChips: 700,
                nRaiseAmount: 100,
                nLastBidChips: 300,
            },
        })).toBe('Raise +100');
    });

    test('falls back to total debit minus call amount for raise labels', () => {
        expect(getPlayerActionLabel({
            sEventName: SOCKET_RESPONSE_EVENTS.RAISE,
            oData: {
                nLastBidChips: 700,
                nToCallAmount: 600,
            },
            potIncrease: 700,
        })).toBe('Raise +100');
    });

    test('keeps call labels based on the call amount', () => {
        expect(getPlayerActionLabel({
            sEventName: SOCKET_RESPONSE_EVENTS.CALL,
            oData: {
                nLastBidChips: 600,
            },
        })).toBe('Call +600');
    });
});
