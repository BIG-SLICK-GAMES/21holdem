// Local practice only. No API, wallet, timer or socket dependencies.
export function score(cards) {
    let total = cards.reduce((sum, card) => sum + (card.nLabel === 1 ? 11 : Math.min(card.nLabel, 10)), 0);
    for (const card of cards) if (card.nLabel === 1 && total > 21) total -= 10;
    return total;
}
export function shuffledDeck(random = Math.random) {
    const cards = ['s', 'h', 'c', 'd'].flatMap(eSuit => Array.from({ length: 13 }, (_, i) => ({ nLabel: i + 1, eSuit })));
    for (let i = cards.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [cards[i], cards[j]] = [cards[j], cards[i]]; }
    return cards;
}
export const totalFor = (player, board) => player.locked ?? score([...player.cards, ...board]);
export function newHand(deck = shuffledDeck()) {
    const remaining = deck.map(card => ({ ...card }));
    const players = ['You', 'Alex', 'Morgan', 'Sam'].map((name, index) => ({ name, cards: [remaining.shift()], chips: 1000, paid: 0, locked: null, folded: false, status: index ? 'Waiting' : 'Your turn' }));
    const state = { players, deck: remaining, board: [], pot: 0, phase: 'bet', bet: 10, log: ['Morgan posts 5. Sam posts 10. Your turn.'], result: '' };
    pay(state, 2, 5); pay(state, 3, 10);
    return state;
}
function pay(state, index, amount) {
    const player = state.players[index];
    player.chips -= amount; player.paid += amount; state.pot += amount;
}
const active = state => state.players.filter(player => !player.folded && totalFor(player, state.board) <= 21);
function finish(state) {
    const eligible = active(state);
    const best = Math.max(...eligible.map(player => totalFor(player, state.board)));
    const winners = eligible.filter(player => totalFor(player, state.board) === best);
    const pot = state.pot;
    // If everyone busts, carry no real value: return the practice contributions.
    if (!winners.length) {
        state.players.forEach(player => { player.chips += 1000 - player.chips; });
        state.result = 'Everyone busted. Practice chips returned.';
    } else {
        winners.forEach((player, index) => { player.chips += Math.floor(pot / winners.length) + (index < pot % winners.length ? 1 : 0); });
        state.result = `${winners.map(player => player.name).join(' and ')} ${winners.length > 1 ? 'split' : 'wins'} the ${pot}-chip pot${eligible.length > 1 ? ` with ${best}` : ''}.`;
    }
    state.pot = 0; state.phase = 'result'; state.log.push(state.result);
}
function advanceBoard(state) {
    if (active(state).length <= 1 || state.board.length >= 4 || active(state).every(player => player.locked !== null)) { finish(state); return; }
    state.board.push(state.deck.shift());
    state.players.forEach(player => {
        player.paid = 0;
        if (player.folded) return;
        const total = totalFor(player, state.board);
        player.status = total > 21 ? 'Bust' : player.locked !== null ? 'Standing' : 'Waiting';
    });
    state.bet = 0; state.phase = 'bet';
    if (active(state).length <= 1) { finish(state); return; }
    // One opponent may open. Decisions use only their own cards and the visible board.
    const opener = state.players.findIndex((player, index) => index > 0 && !player.folded && player.locked === null && totalFor(player, state.board) >= 16 && totalFor(player, state.board) <= 21);
    if (opener > 0) { pay(state, opener, 10); state.bet = 10; state.players[opener].status = 'Bet 10'; state.log.push(`${state.players[opener].name} bets 10.`); }
    else state.log.push('The other players check. Your turn.');
}
function respond(state) {
    state.players.slice(1).forEach((player, offset) => {
        if (player.folded || totalFor(player, state.board) > 21) return;
        const amount = state.bet - player.paid;
        if (amount > 10 && state.board.length > 0 && totalFor(player, state.board) < 12) {
            player.folded = true; player.status = 'Folded';
        } else {
            pay(state, offset + 1, amount);
            player.status = amount ? `Called ${amount}` : 'Checked';
            if (totalFor(player, state.board) >= 17) { player.locked = totalFor(player, state.board); player.status += ' · Standing'; }
        }
        state.log.push(`${player.name}: ${player.status}.`);
    });
}
export function practiceAction(previous, action) {
    if (previous.phase === 'result') return previous;
    const state = { ...previous, players: previous.players.map(player => ({ ...player, cards: [...player.cards] })), deck: [...previous.deck], board: [...previous.board], log: [] };
    const player = state.players[0];
    if (state.phase === 'bet') {
        if (!['call', 'raise', 'fold'].includes(action) || (action === 'raise' && player.locked !== null)) return previous;
        if (action === 'fold') { player.folded = true; player.status = 'Folded'; state.log.push('You fold. The practice players finish the hand.'); }
        else {
            if (action === 'raise') state.bet += 10;
            const amount = state.bet - player.paid;
            pay(state, 0, amount); player.status = amount ? `Paid ${amount}` : 'Checked';
            state.log.push(`You ${action === 'raise' ? 'raise' : amount ? 'call' : 'check'}${amount ? `: ${amount} chips` : ''}.`);
        }
        respond(state);
        if (active(state).length <= 1) finish(state);
        else state.phase = 'choose';
    } else if (state.phase === 'choose') {
        if (!['hit', 'stand', 'continue'].includes(action) || (player.locked !== null && action !== 'continue') || (player.locked === null && action === 'continue')) return previous;
        if (action === 'stand') { player.locked = totalFor(player, state.board); player.status = 'Standing'; state.log.push(`You lock ${player.locked}. Later cards will not change your total.`); }
        else state.log.push(player.locked === null ? 'You take the next community card.' : 'Your total stays locked while the hand continues.');
        advanceBoard(state);
    }
    // Resolve opponents without making a folded/busted user press dummy actions.
    while (state.phase !== 'result' && (player.folded || totalFor(player, state.board) > 21)) {
        if (state.phase === 'bet') respond(state);
        advanceBoard(state);
    }
    return state;
}
