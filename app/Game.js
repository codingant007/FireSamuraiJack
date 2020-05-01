import { insertGame, DECK_KEY, GROUP_KEY, insertPlayer, updateCard, updateCards, updateDeckOrder, ifGameNotExists } from './database/FireBase';
import { exp } from 'react-native-reanimated';
import { ActionSheetIOS } from 'react-native';

/**
 * All Constants needed for game go here
 */

const fullDeck = [
    "as", "2s", "3s", "4s", "5s", "6s", "7s", "8s", "9s", "10s", "js", "qs", "ks",
    "ac", "2c", "3c", "4c", "5c", "6c", "7c", "8c", "9c", "10c", "jc", "qc", "kc",
    "ah", "2h", "3h", "4h", "5h", "6h", "7h", "8h", "9h", "10h", "jh", "qh", "kh",
    "ad", "2d", "3d", "4d", "5d", "6d", "7d", "8d", "9d", "10d", "jd", "qd", "kd"
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
    PLAY_CARD: "PLAY_CARD"
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

/**
 * 1. If game does not exist, initialize deck.
 * 2. Insert player in all cases.
 */
export function setupGame(gameCode, player) {
    ifGameNotExists(gameCode, () => resetGame(gameCode), () => insertPlayer(gameCode, player));
}

export function resetGame(gameCode) {
    console.log("Reset game game");
    insertGame(gameCode, {
        [DECK_KEY]: {cards: allCardsInDeck, order: Object.keys(allCardsInDeck)},
        [GROUP_KEY]: {}
    });
}

export function currentPlayerGroup(player) {
    const group = { [player.playerName]: player };
    return group;
}

export function addPlayerToGame(gameCode, player) {
    
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
            return updateState(deckState, action.payload);
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

function updateState(deckState, actionPayload) {
    if(isValid(actionPayload.newDeckState)) {
        return actionPayload.newDeckState;
    }
    console.log("DB is in illegal state. Not pulling changes.")
    return deckState;
}

function isValid(deckState) {
    return deckState
            && deckState.cards
            && deckState.order
            && Object.keys(deckState.cards).length === fullDeck.length
            && deckState.order.length === fullDeck.length
}

function shuffleCards(deckState, actionPayload) {
    const gameCode = actionPayload.gameCode;
    const shuffledOrder = shuffle(deckState.order);
    updateDeckOrder(gameCode, shuffledOrder);
    console.log("Before shuffle: " + JSON.stringify(deckState.order));
    console.log("After shuffle: " + Array.toString(shuffledOrder));
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
    const cardFromDeck = deckState.cards[cardId];
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

    cardsAfterSettle = Object.values(deckState.cards).reduce((moveCardToPlayerPool(targetPlayerName), {}));
    updateCards(gameCode, cardsAfterSettle);

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
    const cardsAfterDistribute = deckState.order
                               .map((cardId, i) => {
                                   const card = deckState.cards[cardId];
                                    console.log(i);
                                    console.log(JSON.stringify(card));
                                   if(card.status == CardStatus.DECK) {
                                    return { ...card, status: CardStatus.HAND, playerName: nextPlayer() };
                                   }
                                   return card;
                                })
                               .reduce((cards, card) => { return { ...cards, [card.id]: card } }, {});
    console.log("New deck state length: " + Object.keys(cardsAfterDistribute).length);
    console.log("New deck state: " + JSON.stringify(cardsAfterDistribute));

    updateCards(gameCode, cardsAfterDistribute);
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
    const cardsAfterCollect = Object.values(deckState.cards).reduce(moveCardToDeck, {});
    updateCards(gameCode, cardsAfterCollect);
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


