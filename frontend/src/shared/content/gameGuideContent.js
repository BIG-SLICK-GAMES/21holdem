export const RULES_SECTIONS = [
    {
        title: 'Objective',
        paragraphs: [
            "21 Hold'em is a multiplayer card game where each player is trying to finish with the highest valid total at the table.",
            'A valid total is 21 or less. Any hand over 21 is bust and cannot win the pot.',
        ],
    },
    {
        title: 'Table Setup',
        bullets: [
            "21 Hold'em is played with 2 to 9 players.",
            "Players compete against each other, not against a dealer's hand.",
            'A standard 52-card deck is used and shuffled after every hand.',
            'The dealer button rotates after each hand.',
            "The small blind is posted by the player to the dealer's left, and the big blind is posted by the next player clockwise.",
        ],
    },
    {
        title: 'Cards And Totals',
        bullets: [
            'Each player starts with one private hole card.',
            'Community cards can be revealed one round at a time: Action, Stage, Show and Caboose.',
            'Your live total is your private card plus the community cards that still apply to your hand.',
            'Number cards are worth their face value.',
            'Jacks, queens and kings are worth 10.',
            'Aces count as 1 or 11, whichever gives the best valid total.',
        ],
    },
    {
        title: 'Betting Rounds',
        bullets: [
            'The first betting round begins after every player receives a private card.',
            'If no bet is open, a player may check or open the betting.',
            'If a bet is open, a player may call, raise or fold when eligible.',
            'After the table action is settled, players who continue may take the next community-card step.',
            'The hand can progress through Action, Stage, Show and Caboose before showdown.',
        ],
    },
    {
        title: 'Core Actions',
        bullets: [
            'Check: pass the action when no bet is open.',
            'Call: match the current amount required to stay in the hand.',
            'Raise: increase the current bet when raising is available.',
            'Fold: leave the hand and forfeit any claim to the pot.',
            'Hit: confirm that you are continuing to the next community-card step.',
            'Stand: lock your current total and stop taking future community cards.',
        ],
    },
    {
        title: 'Standing',
        bullets: [
            'A standing player keeps the total they had when they stood.',
            'Future community cards do not improve or bust a standing hand.',
            'If another player raises after you stand, you may call or fold only.',
            'Standing removes the option to hit or raise later in that hand.',
        ],
    },
    {
        title: 'Double Down',
        bullets: [
            'Double Down is only available in the first betting round.',
            'A Double Down posts the required double-down amount and gives the player a second private card instead of waiting for community-card improvement.',
            'After doubling down, the player total is locked.',
            'A doubled-down player cannot raise later, but may still be required to call or fold if betting reopens.',
            'If a doubled-down hand reaches exactly 21, that hand can win immediately under the table rules.',
        ],
    },
    {
        title: 'All-In And Raise Limits',
        bullets: [
            'A player who does not have enough chips may commit all remaining chips to call as far as possible.',
            'Raises may be unavailable while an active player is all-in or while the current action state only allows a call or fold.',
            'When you have already stood or doubled down, later pressure is resolved with call or fold decisions.',
        ],
    },
    {
        title: 'Side Bets',
        bullets: [
            'Side bets are optional and are selected before the hand begins.',
            'Twenty-One pays when your final evaluated hand totals exactly 21.',
            'Flush pays when your private card and available community cards make at least three cards of the same suit.',
            'Straight pays when your private card and available community cards make at least three running ranks.',
            'Straight Flush pays the straight-flush bonus when a qualifying straight is also the same suit.',
            'The side-bet popup can be hidden with the "Don\'t show again" option.',
        ],
    },
    {
        title: 'Showdown',
        bullets: [
            'Showdown happens after final betting is complete or when the hand state forces the remaining players to compare totals.',
            'All active players still in the hand must show their cards at showdown.',
            'A player may mark their hole card during the current hand to show it at showdown, but active showdown players reveal regardless.',
            'Folded players and busted hands cannot win the main pot.',
            'The highest valid total of 21 or less wins.',
            'If multiple players tie for the best valid total, the pot is split between them.',
        ],
    },
    {
        title: 'Instant Wins',
        bullets: [
            'A first-round blackjack, meaning an ace with a 10-value card, can win immediately.',
            'A doubled-down hand that reaches exactly 21 can win immediately.',
            'Instant-win rules are applied before normal showdown comparison.',
        ],
    },
];

export const HOW_TO_PLAY_SECTIONS = [
    {
        title: '1. Start the hand',
        bullets: [
            'Wait for the blinds to post and the dealer button to rotate into position.',
            'Each player receives one private hole card.',
            "Read your first card as your starting total, then decide whether to play cautiously or pressure the table.",
        ],
    },
    {
        title: '2. Take your betting action',
        bullets: [
            'Check when no bet is open and you want to pass the action.',
            'Call when another player has bet and you want to stay in.',
            'Raise when you want to increase the price for everyone else, if raising is available.',
            'Fold when the hand is not worth continuing.',
        ],
    },
    {
        title: '3. Choose Hit or Stand',
        bullets: [
            'Hit means you are continuing to the next community-card step.',
            'Stand locks your current total and future community cards no longer count for you.',
            'If you stand and another player raises later, your choices are call or fold.',
        ],
    },
    {
        title: '4. Follow the community cards',
        bullets: [
            'The table can reveal Action, Stage, Show and Caboose cards.',
            'Community cards improve every player who is still taking cards.',
            'Stopped hands keep their locked total even if later community cards would have helped or busted them.',
        ],
    },
    {
        title: '5. Use Double Down carefully',
        bullets: [
            'Double Down is only offered in the first betting round.',
            'It gives you a second private card and locks your total.',
            'After doubling down you cannot raise, but you may still need to call or fold if someone else reopens betting.',
        ],
    },
    {
        title: '6. Understand side bets',
        bullets: [
            'Side bets are optional pre-hand wagers.',
            'Twenty-One, Flush, Straight and Straight Flush resolve from your final evaluated cards.',
            'Use the side-bet popup checkbox if you do not want the selector to appear automatically.',
        ],
    },
    {
        title: '7. Read showdown',
        bullets: [
            'At showdown, every active player still in the hand reveals their cards.',
            'The best total of 21 or less wins the pot.',
            'Hands over 21 are bust.',
            'Tied winning totals split the pot.',
        ],
    },
    {
        title: '8. Show your hole card',
        bullets: [
            'Use the eye icon on your hole card when you want that card marked for reveal this hand.',
            'The selection resets after the hand.',
            'At showdown, all active players reveal anyway, so the eye icon is a current-hand reveal preference rather than a permanent setting.',
        ],
    },
];

export const GUEST_HELP_HOW_TO_PLAY_SECTIONS = [
    {
        title: 'Opening hand',
        bullets: [
            'Every player starts with one private hole card.',
            "You are playing against the other players' totals, not a dealer hand.",
        ],
    },
    {
        title: 'Player choices',
        bullets: [
            'Check when no bet is open.',
            'Call, raise or fold when betting is open and those options are available.',
            'Hit continues to the next community-card step.',
            'Stand locks your current total.',
        ],
    },
    {
        title: 'Locked hands',
        bullets: [
            'Standing stops future community cards from counting for you.',
            'Double Down is first-round only and locks your total after a second private card.',
            'Standing or doubled-down players can still face call-or-fold decisions.',
        ],
    },
    {
        title: 'Winning',
        bullets: [
            'Closest to 21 without going over wins.',
            'All active players reveal at showdown.',
            'Tied winning totals split the pot.',
        ],
    },
];

export const GUEST_HELP_RULES_SECTIONS = [
    {
        title: 'Table structure',
        bullets: [
            "The game runs with 2 to 9 players and a rotating dealer button.",
            "Small blind and big blind are posted by the two players to the dealer's left.",
            'The deck is shuffled after each hand.',
        ],
    },
    {
        title: 'Cards',
        bullets: [
            'Players start with one private hole card.',
            'Action, Stage, Show and Caboose community cards can be revealed as the hand progresses.',
            'Aces count as 1 or 11, face cards count as 10, and number cards count as face value.',
        ],
    },
    {
        title: 'Actions',
        bullets: [
            'Check if no bet is open.',
            'Call or fold when you must answer a bet.',
            'Raise only when the action state allows it.',
            'Hit continues to another community card.',
            'Stand locks your current total.',
        ],
    },
    {
        title: 'Special rules',
        bullets: [
            'Double Down is first-round only and gives a second private card.',
            'Standing and Double Down both lock your total.',
            'Locked players can still call or fold if later betting pressure reaches them.',
            'Raises may be blocked when an active opponent is all-in.',
        ],
    },
    {
        title: 'Scoring and payouts',
        bullets: [
            'The highest active total of 21 or less wins.',
            'Busted and folded players cannot win the main pot.',
            'All active players reveal at showdown.',
            'Tied winning totals split the pot.',
        ],
    },
];
