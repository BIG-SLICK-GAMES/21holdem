const amount = value => new Intl.NumberFormat('en-AU', { maximumFractionDigits: 0 }).format(value);

export function playInformation({ signedIn, chips, tables = [], loading }) {
    if (!signedIn) return 'Sign in to see your bankroll and the highest table buy-in you can afford.';
    if (chips == null || chips === '' || !Number.isFinite(Number(chips)) || Number(chips) < 0) {
        return 'Your bankroll is not available yet. Once it loads, we will show the highest table buy-in you can afford.';
    }
    const balance = Number(chips);
    const intro = `You have ${amount(balance)} chips in your bankroll.`;
    if (loading && !tables.length) return `${intro} Checking the available tables…`;
    const valid = tables.filter(table => table?.nMinBuyIn != null && table.nMinBuyIn !== '' && Number.isFinite(Number(table.nMinBuyIn)) && Number(table.nMinBuyIn) >= 0);
    if (!valid.length) return `${intro} Table information is currently unavailable. Please check again shortly.`;
    const affordable = valid.filter(table => Number(table.nMinBuyIn) <= balance)
        .sort((a, b) => Number(b.nMinBuyIn) - Number(a.nMinBuyIn));
    if (!affordable.length) {
        const minimum = Math.min(...valid.map(table => Number(table.nMinBuyIn)));
        return `${intro} You need ${amount(minimum - balance)} more chips for the lowest table buy-in of ${amount(minimum)}.`;
    }
    const best = affordable[0];
    return `${intro} You can afford ${best.sName || 'the live table'} with a ${amount(Number(best.nMinBuyIn))}-chip buy-in — the highest buy-in your bankroll covers. You can also choose a lower table.`;
}
