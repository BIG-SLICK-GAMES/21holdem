import { SOCKET_RESPONSE_EVENTS } from '../../scripts/socketEvents';

export const actionLabelText = Object.freeze({
    allIn: 'All In',
    call: 'Call',
    raise: 'Raise',
    raiseStand: 'Raise+Stand',
    callStand: 'Call+Stand',
    stand: 'Stand',
    check: 'Check',
    doubleDown: 'Double Down',
    fold: 'Fold',
    bust: 'Bust',
    missed: 'Missed',
});

function formatActionAmount(value) {
    const nAmount = Math.max(0, Math.round(Number(value) || 0));
    if (!nAmount) return '';
    return ` +${String(nAmount).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function getRaiseAmount(oData = {}, potIncrease = 0) {
    const nExplicitRaiseAmount = Number(oData.nRaiseAmount ?? oData.nActualRaiseAmount);
    if (Number.isFinite(nExplicitRaiseAmount) && nExplicitRaiseAmount > 0) return nExplicitRaiseAmount;

    const nTotalDebit = Number(oData.nTotalDebit ?? oData.nLastBidChips ?? potIncrease);
    const nToCallAmount = Number(oData.nToCallAmount);
    if (Number.isFinite(nTotalDebit) && nTotalDebit > 0 && Number.isFinite(nToCallAmount) && nToCallAmount > 0) {
        return Math.max(0, nTotalDebit - nToCallAmount);
    }

    if (Number.isFinite(nTotalDebit) && nTotalDebit > 0) return nTotalDebit;
    return Math.max(0, Number(potIncrease) || 0);
}

export function getPlayerActionLabel({ sEventName, oData = {}, recentLogs = [], potIncrease = 0 } = {}) {
    if (sEventName === SOCKET_RESPONSE_EVENTS.CALL) {
        const nCallAmount = Math.max(0, Number(oData.nLastBidChips ?? oData.nCurrentChips ?? potIncrease) || 0);
        if (nCallAmount <= 0 && Math.max(0, Number(potIncrease) || 0) <= 0) return actionLabelText.check;
        const sAmount = formatActionAmount(nCallAmount || potIncrease);
        return oData.bAllIn ? `${actionLabelText.allIn}${sAmount}` : `${actionLabelText.call}${sAmount}`;
    }

    if (sEventName === SOCKET_RESPONSE_EVENTS.RAISE) {
        const sAmount = formatActionAmount(getRaiseAmount(oData, potIncrease));
        return oData.bAllIn ? `${actionLabelText.allIn}${sAmount}` : `${actionLabelText.raise}${sAmount}`;
    }

    if (sEventName === SOCKET_RESPONSE_EVENTS.STAND) {
        const lastRaiseLog = recentLogs.find(log => log.sAction === 'raise+stand' && log.iUserId === oData.iUserId);
        if (lastRaiseLog) return actionLabelText.raiseStand;

        const lastCallStandLog = recentLogs.find(log => log.sAction === 'call+stand' && log.iUserId === oData.iUserId);
        if (lastCallStandLog) return actionLabelText.callStand;

        return actionLabelText.stand;
    }

    if (sEventName === SOCKET_RESPONSE_EVENTS.CHECK) return actionLabelText.check;

    if (sEventName === SOCKET_RESPONSE_EVENTS.DOUBLE_DOWN) return actionLabelText.doubleDown;

    return '';
}
