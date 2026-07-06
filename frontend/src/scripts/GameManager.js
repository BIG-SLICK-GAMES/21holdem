import config from './config';

/**
 * GameManager — client-side settings and layout config.
 * - Holds timers, limits, and UI layout values (not game logic).
 * - oSetting keys must match server expectations — do not rename.
 * - Seat x/y positions are in getPlayerProfileSpecs().
 */

export default class GameManager {
    constructor(oScene) {
        this.oScene = oScene;

        // Timers and limits (ms). Keys must not be renamed — server expects them.
        this.oSetting = {
            "nInitializeTimer": 4000,       // delay before first action
            "nMaxScoreBoundary": 21,         // bust limit
            "nHighDroppedPenalty": 40,
            "nLowDroppedPenalty": 20,
            "nCardDistributionDelay": 3800,  // pause before dealing
            "nBeginCountdown": 25000,        // pre-game countdown
            "nDistributeCardAnimationDelay": 2000,
            "nAnimationCountdown": 1000,
            "nAllocatedTurnTime": 20000,     // UI turn countdown
            "nTurnTime": 30000,              // total turn window (with buffers)
            "nTurnBuffer": 1000,
            "nDeclareTTL": 20000,            // how long result screen shows
            "nFinishTTL": 30000,
            "nMaxCardGroup": 5,
            "nMaxWaitingTime": 30000,
            "nMaxTurnMissAllowed": 3,
            "nMaxBot": 1,
            "nPrivateTableWaitingTimeOut": 600000, // 10 min private table wait
            "nRoundStartsIn": 10000,
            "oTax": {
                "nDeduction": 30,
                "nOffset": 1
            }
        };
        this.oGameInfo = {
            nTableEntryFee: 0,
            nMaxPlayer: 9,
            nSmallBlindAmount: 0,
            nBigBlindAmount: 0
        };
        this.nMaxPlayer = 9;
        this.nMaxCards = 1;
        this.nCardGap = 50;
        this.nGroupGap = 50;
        this.nCardY = 700;
        this.nMaxGroup = 6;
        this.isPractice = true;
        this.nCardDuration = 300;
        this.nMyPlayerChips = 0;
        this.nPotAmount = 0;
        this.aCommunityCards = [];
        this.aPlayerCards = [];
        this.aWinnerPlayers = [];
        this.exitMessage = 'Are you sure you want to quit?';

    }

    // Seat x/y positions for desktop and mobile layouts.
    getPlayerProfileSpecs(nPlayer) {
        const aPlayerProfile = config.isDesktopLayout()
            ? [
                { x: 960, y: 860 }, // 0
                { x: 600, y: 760 }, // 1
                { x: 310, y: 600 }, // 2
                { x: 310, y: 260 }, // 3
                { x: 640, y: 160 }, // 4
                { x: 1280, y: 160 }, // 5
                { x: 1610, y: 260 }, // 6
                { x: 1610, y: 600 }, // 7
                { x: 1320, y: 760 }, // 8
            ]
            : [
                { x: 540, y: 1264 }, // 0 - local player
                { x: 254, y: 1130 }, // 1 - left rail row 4
                { x: 232, y: 990 },  // 2 - left rail row 3
                { x: 210, y: 850 },  // 3 - left rail row 2
                { x: 188, y: 710 },  // 4 - left rail row 1
                { x: 892, y: 710 },  // 5 - right rail row 1
                { x: 870, y: 850 },  // 6 - right rail row 2
                { x: 848, y: 990 },  // 7 - right rail row 3
                { x: 826, y: 1130 }, // 8 - right rail row 4
            ];
        return aPlayerProfile[nPlayer];
    }
    getHighCardSpecs(nPlayer) {
        const aHighCards = [
            [],
            [],
            [
                { x: 960, y: 695 },
                { x: 960, y: 410 },
            ],
            [],
            [],
            [],
            [
                { x: 960, y: 695 },
                { x: 360, y: 570 },
                { x: 550, y: 410 },
                { x: 960, y: 410 },
                { x: 1370, y: 410 },
                { x: 1560, y: 570 },
            ],
        ]
        return aHighCards[this.nMaxPlayer][nPlayer];
    }
    reorganizeHand(hand) {
        const groupedHand = [];
        const groupMap = new Map();

        // Group cards by nGroupId
        hand.forEach(card => {
            if (!groupMap.has(card.nGroupId)) {
                groupMap.set(card.nGroupId, []);
            }
            groupMap.get(card.nGroupId).push(card);
        });

        // Sort groups and reassign nGroupId if needed
        let newGroupId = 0;
        Array.from(groupMap.entries())
            .sort(([a], [b]) => a - b)
            .forEach(([, group]) => {
                group.forEach(card => card.nGroupId = newGroupId);
                groupedHand.push(group);
                newGroupId++;
            });

        return groupedHand;
    }
    extractIds(hand) {
        return hand.map(card => ({ iCardId: card._id, nGroupId: card.nGroupId }));
    }
}
