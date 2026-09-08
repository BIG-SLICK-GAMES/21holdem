export const HAND_RESULT_REVEAL_DELAY_MS = 500;
export const HAND_RESULT_CLEAR_DELAY_MS = 6600;

export function createHandResultToken(now = Date.now) {
    return Number(now()) || Date.now();
}

export function isActiveHandResultToken(currentToken, expectedToken, bShowingHandResult) {
    return currentToken === expectedToken && bShowingHandResult === true;
}

export function shouldShowNextRoundCountdown(nRoundStartsIn) {
    const nRoundDelay = Number(nRoundStartsIn);
    return nRoundDelay > HAND_RESULT_CLEAR_DELAY_MS && nRoundDelay !== 4000;
}
