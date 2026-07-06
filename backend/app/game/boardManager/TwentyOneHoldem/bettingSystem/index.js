const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

function isCheckOpenState(participant) {
  const actions = Array.isArray(participant?.aUserAction) ? participant.aUserAction : [];
  return actions.includes('ck') && !actions.includes('c');
}

function getCallAmount(board, participant) {
  if (isCheckOpenState(participant)) return 0;
  return Math.max(toNumber(board?.nMinBet) - toNumber(participant?.nLastBidChips), 0);
}

function hasActiveAllInOpponent(board, participant) {
  return (board?.aParticipant || []).some(candidate =>
    String(candidate?.iUserId) !== String(participant?.iUserId) &&
    candidate?.eState === 'playing' &&
    candidate?.isAllInLock
  );
}

function getAvailableTurnActions(board, participant, toCallAmount = getCallAmount(board, participant)) {
  if (participant?.isAllInLock && participant?.bPendingAllInStandChoice) return ['c', 's'];

  const nToCallAmount = Math.max(0, toNumber(toCallAmount));
  const actions = Array.isArray(participant?.aUserAction) ? [...participant.aUserAction] : [];
  const normalized = actions.map(action => {
    if (nToCallAmount <= 0 && action === 'c') return 'ck';
    if (nToCallAmount > 0 && action === 'ck') return 'c';
    return action;
  });
  const unique = [...new Set(normalized)];
  if (!hasActiveAllInOpponent(board, participant)) return unique;
  return unique.filter(action => action !== 'r');
}

function markAllInIfNeeded(participant, { pendingStandChoice = false, standMode = false } = {}) {
  if (!participant || toNumber(participant.nChips) > 0) return false;
  participant.nChips = 0;
  participant.isAllInLock = true;
  participant.bPendingAllInStandChoice = Boolean(pendingStandChoice);
  if (standMode) {
    participant.isDoubleDownLock = true;
    participant.bPendingAllInStandChoice = false;
    participant.nStandAtRound = participant.oBoard?.nTableRound || participant.nStandAtRound || 1;
  }
  if (!participant.bPendingAllInStandChoice) participant.aUserAction = ['c', 'f'];
  return true;
}

function lockStand(participant, board) {
  participant.isDoubleDownLock = true;
  participant.bPendingAllInStandChoice = false;
  participant.nStandAtRound = board?.nTableRound || participant.nStandAtRound || 1;
  participant.aUserAction = ['c', 'f'];
}

function markRaiseReopensAction(board, actor) {
  (board?.aParticipant || []).forEach(participant => {
    if (participant?.eState !== 'playing') return;
    if (toNumber(board?.nTableRound, 1) > 1) {
      participant.aUserAction = (participant.aUserAction || []).map(action => (action === 'ck' ? 'c' : action));
    }
    if (String(participant.iUserId) !== String(actor?.iUserId)) participant.nPlayerTurnCount = 0;
  });
}

function markBetDefendedAfterCheck(board) {
  if (toNumber(board?.nTableRound, 1) <= 1) return;
  (board?.aParticipant || []).forEach(participant => {
    if (participant?.eState !== 'playing') return;
    participant.aUserAction = (participant.aUserAction || []).map(action => (action === 'ck' ? 'c' : action));
  });
}

function buildParticipantPatch(participant) {
  return {
    iUserId: participant?.iUserId,
    nChips: toNumber(participant?.nChips),
    nRoundBidChips: toNumber(participant?.nLastBidChips),
    nTotalBidChips: toNumber(participant?.nTotalBidChips),
    isAllInLock: Boolean(participant?.isAllInLock),
    isDoubleDownLock: Boolean(participant?.isDoubleDownLock),
    bPendingAllInStandChoice: Boolean(participant?.bPendingAllInStandChoice),
    nStandAtRound: toNumber(participant?.nStandAtRound),
    aUserAction: Array.isArray(participant?.aUserAction) ? [...participant.aUserAction] : [],
  };
}

function buildActionPayload(board, participant, {
  nActionAmount = 0,
  aParticipantAdjustments = [],
  extra = {},
} = {}) {
  const participantPatch = buildParticipantPatch(participant);
  return {
    ...participantPatch,
    ...extra,
    nTableChips: toNumber(board?.nTableChips),
    nMaxBet: toNumber(board?.nMaxBet),
    nMinBet: toNumber(board?.nMinBet),
    nLastBidChips: Math.max(0, toNumber(nActionAmount)),
    aParticipantAdjustments,
  };
}

async function debitToPot(participant, amount) {
  const board = participant?.oBoard;
  const nAmount = Math.max(0, toNumber(amount));
  if (!participant || !board || nAmount <= 0) return 0;

  await participant.updateUser({ $inc: { nChips: -nAmount, nTotalBetAmount: nAmount } });
  participant.nChips = Math.max(0, toNumber(participant.nChips) - nAmount);
  participant.nLastBidChips = toNumber(participant.nLastBidChips) + nAmount;
  participant.nTotalBidChips = toNumber(participant.nTotalBidChips) + nAmount;
  board.nTableChips = toNumber(board.nTableChips) + nAmount;
  board.nMaxBet = board.nTableChips;

  await participant.recordTransaction({
    iUserId: participant.iUserId,
    iBoardId: board._id,
    nAmount,
    eType: 'debit',
    eMode: 'game',
    eStatus: 'Success',
    nGameRound: board.nGameRound,
  });

  return nAmount;
}

module.exports = {
  toNumber,
  isCheckOpenState,
  getCallAmount,
  getAvailableTurnActions,
  hasActiveAllInOpponent,
  markAllInIfNeeded,
  lockStand,
  markRaiseReopensAction,
  markBetDefendedAfterCheck,
  buildParticipantPatch,
  buildActionPayload,
  debitToPot,
};
