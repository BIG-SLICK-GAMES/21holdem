const gameTimingControls = Object.freeze({
    actionLabels: Object.freeze({
        durationMs: 1500,
    }),
    potTransfer: Object.freeze({
        animationDurationMs: 1120,
        startDelayMs: 80,
        chipStaggerMs: 42,
        settleBufferMs: 300,
        afterAnimationBufferMs: 500,
        maxChips: 10,
    }),
});

export default gameTimingControls;
