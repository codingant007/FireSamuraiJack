import database from '@react-native-firebase/database';
import { groupReducer } from '../Game';

const firebase = database();

/**
 * Resource paths:
 *      - Card: <GameCode>/cards/<CardId>
 *      - Player: <GameCode>/players/<PlayerName>
 * Schema:
 *      - Card:
 *          cardId:
 *          cardStatus:
 *          playerName:
 *      - Player:
 *          playerName:
 *          isDealer:
 *          
 */
export const DECK_KEY = "cards";
export const GROUP_KEY = "players"

/**
 * Listen operations
 */
export function onDeckUpdate(gameCode, setDeckState) {
    const deckReference = firebase.ref()
        .child(gameCode)
        .child(DECK_KEY);
    deckReference.on('value', snapshot => {
        console.log("Detected a change in deck: " + JSON.stringify(snapshot.val()))
        setDeckState(snapshot.val());
    });
    return () => deckReference.off('value');
}

export function onGroupUpdate(gameCode, setGroupState) {
    const groupReference = firebase.ref()
        .child(gameCode)
        .child(GROUP_KEY)
    groupReference.on('value', snapshot => {
        console.log("Detected an change in group: " + JSON.stringify(snapshot.val()))
        setGroupState(snapshot.val());
    });
    return () => {console.log("Turning off updates from group");groupReference.off('value');};
}

export function ifGameNotExists(gameCode, callback) {
    firebase.ref()
    .child(gameCode)
    .once('value', snapshot => {
        console.log("ExistingGame: " + JSON.stringify(snapshot.val()));
        if(!snapshot.val()) {
            callback();
        }
    })
}

/**
 * Write operations
 */
export function insertGame(gameCode, game) {
    console.log("Inserting game: " + JSON.stringify(game));
    firebase.ref()
        .child(gameCode)
        .set(game);
}

export function insertPlayer(gameCode, player) {
    console.log("Inserting player: " + JSON.stringify(player));
    firebase.ref()
        .child(gameCode)
        .child(GROUP_KEY)
        .child(player.playerName)
        .set(player);
}

export function updateCard(gameCode, card) {
    console.log("Updating card: " + JSON.stringify(card));
    firebase.ref()
            .child(gameCode)
            .child(DECK_KEY)
            .child(card.id)
            .set(card);
}

export function updateDeck(gameCode, deckState) {
    console.log("Updating full deck: " + JSON.stringify(deckState));
    firebase.ref()
            .child(gameCode)
            .child(DECK_KEY)
            .set(deckState);
}