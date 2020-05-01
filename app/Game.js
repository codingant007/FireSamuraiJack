import { insertGame, DECK_KEY, GROUP_KEY, insertPlayer, updateCard, updateDeck, ifGameNotExists } from './database/FireBase';
import { exp } from 'react-native-reanimated';
import { ActionSheetIOS } from 'react-native';

/**
 * All Constants needed for game go here
 */

// const fullDeck = [
//     "as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "10s", "js", "qs", "ks",
//     "ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "10c", "jc", "qc", "kc",
//     "ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "jh", "qh", "kh",
//     "ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "10d", "jd", "qd", "kd"
// ];

const fullDeck = [
    "card1", "card2", "card3", "card4"
];

export const CardStatus = {
    DECK: "DECK",
    DISCARDED: "DISCARDED",
    POOL: "POOL",
    HAND: "HAND",
    PLAYER_POOL: "PLAYER_POOL"
};

/**
 * Actions to be supported in future:
 *      - Pick from deck
 */
export const PLAYER_ACTIONS = {
    PLAY_CARD: {
        name: "PLAY_CARD",
    }
};

/**
 * Actiosn to be supported in future:
 *      - Shuffle cards in deck
 */
export const DEALER_ACTIONS = {
    SHUFFLE_CARDS: "SHUFFLE_CARDS",
    DISTRIBUTE_CARDS: "DISTRIBUTE_CARDS",
    COLLECT_CARDS: "COLLECT_CARDS",
    SETTLE_POOL: "SETTLE_POOL",
    RESET_GAME: "RESET_GAME"
};

export const DB_ACTIONS = {
    SET_STATE: "SET_STATE"
}

export const GroupActions = {
    CREATE: "CREATE",
    JOIN: "JOIN"
}

export const allCardsInDeck = fullDeck.reduce((cards, card) => { cards[card] = { id: card, status: CardStatus.DECK }; return cards; }, {});

export function setupGame(gameCode) {
    ifGameNotExists(gameCode, () => resetGame(gameCode));
}

export function resetGame(gameCode) {
    insertGame(gameCode, {
        [DECK_KEY]: allCardsInDeck,
        [GROUP_KEY]: {}
    });
}

export function currentPlayerGroup(player) {
    const group = { [player.playerName]: player };
    return group;
}

export function addPlayerToGame(gameCode, player) {
    insertPlayer(gameCode, player);
}

/**
 * All reducers go here
 */
export function deckReducer(deckState, action) {
    console.log("Before switch");
    console.log("Deckstate: " + JSON.stringify(deckState));
    console.log("Action: " + JSON.stringify(action));
    switch (action.type) {
        case DB_ACTIONS.SET_STATE:
            return action.payload.newDeckState;
        case PLAYER_ACTIONS.PLAY_CARD:
            return playCard(deckState, action.payload);
        case DEALER_ACTIONS.SETTLE_POOL:
            return settlePool(deckState, action.payload);
        case DEALER_ACTIONS.DISTRIBUTE_CARDS:
            console.log("Case DIST CARDS");
            return distributeCards(deckState, action.payload);
        case DEALER_ACTIONS.COLLECT_CARDS:
            return collectCards(deckState, action.payload);
        case DEALER_ACTIONS.SHUFFLE_CARDS:
            return shuffleCards(deckState, action.payload);
        case DEALER_ACTIONS.RESET_GAME:
            resetGame(action.payload.gameCode);
            return deckState;
        default:
            break;
    }
    return deckState;
}

function shuffleCards(deckState, actionPayload) {
    const gameCode = actionPayload.gameCode;
    const newDeckState = shuffle(Object.values(deckState))
                            .reduce((cards, card) => {return {...cards, [card.id]: card}}, {});
    updateDeck(gameCode, newDeckState);
    console.log("Before shuffle: " + JSON.stringify(deckState));
    console.log("After shuffle: " + JSON.stringify(newDeckState));
    return deckState;
}

function shuffle(arr) {
    let array = arr;
    for (let i = array.length - 1; i >= 0; i--) {
      let randomIndex = Math.floor(Math.random() * (i + 1));
      let itemAtIndex = array[randomIndex];
  
      array[randomIndex] = array[i];
      array[i] = itemAtIndex;
    }
    return array;
  }

function playCard(deckState, actionPayload) {
    const playerName = actionPayload.player.playerName;
    const gameCode = actionPayload.gameCode;
    const cardId = actionPayload.card.id;
    const cardFromDeck = deckState[cardId];
    if (cardFromDeck.status === CardStatus.HAND && cardFromDeck.playerName === playerName) {
        // const newDeckState = {...deckState, [cardId]: {id: cardId, status: CardStatus.POOL}};
        updateCard(gameCode, { id: cardId, status: CardStatus.POOL })
    }
    console.log("Player's request to play a card that is not in thier hand was considered a no-op.");
    return deckState;
}

function settlePool(deckState, actionPayload) {
    const targetPlayerName = actionPayload.player.playerName;
    const gameCode = actionPayload.gameCode;

    newDeckState = Object.values(deckState).reduce((moveCardToPlayerPool(targetPlayerName), {}));
    updateDeck(gameCode, newDeckState);

    return deckState;
}

const moveCardToPlayerPool = curry(
    function (targetPlayerName, cards, card) {
        if (card.status === CardStatus.POOL) {
            return { ...cards, [card.id]: { id: card.id, status: CardStatus.PLAYER_POOL, playerName: targetPlayerName } };
        }
        return { ...cards, [card.id]: card };
    }
)

function curry(func) {
    return function curried(...args) {
        if (args.length >= func.length) {
            return func.apply(this, args);
        } else {
            return function (...args2) {
                return curried.apply(this, args.concat(args2));
            }
        }
    };

}

function distributeCards(deckState, actionPayload) {
    const gameCode = actionPayload.gameCode;
    const groupState = actionPayload.groupState;

    const players = Object.keys(groupState);
    console.log("Distributing cards to: " + JSON.stringify(players));
    console.log("Before distribute: " + JSON.stringify(deckState));
    console.log("Before distribute: " + JSON.stringify(Object.values(deckState)));

    const nextPlayer = cyclicIterator(players);
    const newDeckState = Object.values(deckState)
                               .map((card, i) => {
                                    console.log(i);
                                    console.log(JSON.stringify(card));
                                   if(card.status == CardStatus.DECK) {
                                    return { ...card, status: CardStatus.HAND, playerName: nextPlayer() };
                                   }
                                   return card;
                                })
                               .reduce((deckState, card) => { return { ...deckState, [card.id]: card } }, {});
    console.log("New deck state length: " + Object.keys(newDeckState).length);
    console.log("New deck state: " + JSON.stringify(newDeckState));

    updateDeck(gameCode, newDeckState);
    return deckState;
}

function cyclicIterator(array) {
    var index = 0;
    return function() {
        if(index >= array.length) {
            index = 0;
        }
        const out = array[index++];
        console.log("CyclicIterator: " + out);
        return out;
    }
}

function collectCards(deckState, actionPayload) {
    const gameCode = actionPayload.gameCode;
    const newDeckState = Object.values(deckState).reduce(moveCardToDeck, {});
    console.log("collectCards DeckState.length: " + Object.keys(deckState).length);
    console.log("collectCards NewDeckState.length: " + Object.keys(newDeckState).length);
    Object.keys(deckState).forEach((cardId) => {
        if(!newDeckState[cardId]) {
            console.log("collectCards missing: " + cardId);
        }
    })
    updateDeck(gameCode, newDeckState);
    return deckState;
}

function moveCardToDeck(cards, card) {
    if (card.status === CardStatus.DISCARDED) {
        return { ...cards, [card.id]: card };
    }
    return { ...cards, [card.id]: { id: card.id, status: CardStatus.DECK } };
}

export function groupReducer(state, action) {
    // TODO: Implement action handling.
    switch (action.type) {
        case DB_ACTIONS.SET_STATE:
            return action.payload.newGroupState;
            break;

        default:
            break;
    }
    return state;
}


