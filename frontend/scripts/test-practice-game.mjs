import assert from 'node:assert/strict';
import { score, shuffledDeck, newHand, practiceAction, totalFor } from '../src/views/mobile/practiceGame.mjs';
const cards = ranks => ranks.map(nLabel => ({ nLabel, eSuit: 's' }));
assert.equal(score(cards([1, 1, 9])), 21);
assert.equal(score(cards([1, 13])), 21);
assert.equal(score(cards([13, 12, 2])), 22);
const deck = [...cards([11, 7, 8, 9, 4, 7, 2, 3]), ...shuffledDeck()];
let game = newHand(deck);
const initial = JSON.stringify(game);
assert.equal(game.pot, 15);
game = practiceAction(game, 'call');
assert.equal(game.pot, 40);
assert.equal(game.players[0].chips, 990);
assert.equal(JSON.stringify(newHand(deck)), initial);
game = practiceAction(game, 'hit');
assert.equal(totalFor(game.players[0], game.board), 14);
game = practiceAction(game, 'call');
game = practiceAction(game, 'stand');
assert.equal(totalFor(game.players[0], game.board), 14);
assert.equal(game.board.length, 2);
assert.equal(practiceAction(game, 'raise'), game, 'standing player cannot raise');
while (game.phase !== 'result') game = practiceAction(game, game.phase === 'bet' ? 'call' : 'continue');
assert.equal(totalFor(game.players[0], game.board), 14);
assert.match(game.result, /Sam wins/);
const folded = practiceAction(newHand(deck), 'fold');
assert.equal(folded.phase, 'result');
assert.equal(folded.players[0].chips, 1000);
assert.ok(!folded.result.startsWith('You'));
let tie = newHand([...cards([10, 10, 10, 10, 7]), ...shuffledDeck()]);
tie = practiceAction(practiceAction(tie, 'call'), 'hit');
tie = practiceAction(practiceAction(tie, 'call'), 'stand');
assert.equal(tie.phase, 'result');
assert.match(tie.result, /split/);
assert.equal(tie.players[0].chips, 1000);
for (let hand = 0; hand < 300; hand++) {
    let state = newHand();
    for (let turn = 0; state.phase !== 'result'; turn++) {
        assert.ok(turn < 16, 'practice hand must finish');
        const player = state.players[0];
        const action = state.phase === 'bet' ? (turn === 0 && hand % 7 === 0 ? 'fold' : player.locked === null && hand % 3 === 0 ? 'raise' : 'call') : player.locked !== null ? 'continue' : totalFor(player, state.board) >= 17 ? 'stand' : 'hit';
        state = practiceAction(state, action);
        assert.equal(state.pot + state.players.reduce((sum, p) => sum + p.chips, 0), 4000, 'chips conserved');
        assert.ok(state.players.every(p => p.chips >= 0));
        assert.ok(state.board.length <= 4);
    }
    assert.equal(practiceAction(state, 'call'), state, 'completed hands cannot pay out twice');
}
console.log('PASS practice scoring, chips, call/raise/fold, locked totals, showdown/ties, and 300 completed hands');
