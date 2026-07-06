function getPlayerTurnDurationMs(oSetting = {}, { tutorial = false } = {}) {
  if (tutorial) return null;

  const nTurnTime = Number(oSetting.nTurnTime) || 0;
  const nTurnBuffer = Number(oSetting.nTurnBuffer) || 0;
  return Math.max(0, nTurnTime - nTurnBuffer);
}

function buildTurnTimerPayload(oSetting = {}, options = {}) {
  const durationMs = getPlayerTurnDurationMs(oSetting, options);
  return {
    ttl: durationMs,
    nTotalTurnTime: durationMs,
  };
}

module.exports = {
  buildTurnTimerPayload,
  getPlayerTurnDurationMs,
};
