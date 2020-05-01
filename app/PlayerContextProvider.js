import React, { useState } from 'react';

const PlayerContext = React.createContext(null);

export function PlayerContextProvider({ children }) {
    const [playerName, setPlayerName] = useState();
    const [isDealer, setIsDealer] = useState(false);

    return (
        <PlayerContext.Provider value={{ playerName, setPlayerName, isDealer, setIsDealer }}>
            {children}
        </PlayerContext.Provider>
    )
}

export {PlayerContext}