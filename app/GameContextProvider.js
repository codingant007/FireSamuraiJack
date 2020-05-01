import React, { useReducer, useContext, useEffect } from "react";
import { deckReducer, allCardsInDeck, groupReducer, setupGame, addPlayerToGame, currentPlayerGroup, DB_ACTIONS } from "./Game";
import { PlayerContext } from "./PlayerContextProvider";
import { onDeckUpdate, onGroupUpdate } from "./database/FireBase";

export const GameContext = React.createContext(null);

export function GameContextProvider({children, gameCode}) {
    
    const {playerName, isDealer} = useContext(PlayerContext);
    const player = {playerName, isDealer};
    const [deckState, dispatchDeckAction] = useReducer(deckReducer, allCardsInDeck, (initialState) => initialState);
    const [groupState, dispatchGroupAction] = useReducer(groupReducer, player, currentPlayerGroup);

    console.log("CurrentPlayerGroup(player): " + currentPlayerGroup(player));
    console.log("Intial deckState: " + JSON.stringify(deckState));
    console.log("Initial groupState: " + JSON.stringify(groupState));

    useEffect(() => {
        setupGame(gameCode);
        addPlayerToGame(gameCode, {playerName, isDealer});
    }, [gameCode]);

    // Subscribe to deck and group updates. useEffect will use off callbacks and make sure that they are un-subscribed when component is no loonger needed.
    useEffect(() => {
        return onDeckUpdate(gameCode, (newDeckState) => dispatchDeckAction({type: DB_ACTIONS.SET_STATE, payload: {newDeckState}}));
    }, [gameCode]);
    useEffect(() => {
        return onGroupUpdate(gameCode, (newGroupState) => dispatchGroupAction({type: DB_ACTIONS.SET_STATE, payload: {newGroupState}}));        
    }, [gameCode]);

    return (
      <GameContext.Provider value={{gameCode, deckState, dispatchDeckAction, groupState, dispatchGroupAction}} >
          {children}
      </GameContext.Provider>
    );
}

export const GameContextConsumer = GameContext.Consumer;