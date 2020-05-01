import React, { useContext } from "react"
import { PlayerContext } from "./PlayerContextProvider"
import { Text, View } from "react-native";

export function PlayerName({flex}) {
    const {playerName, isDealer} = useContext(PlayerContext);

    return (
        <View style={{flex: flex, backgroundColor: "powderblue"}}>
            <Text>
                Player name: {playerName}
            </Text>
            <Text>
                Is Dealer: {String(isDealer)}
            </Text>
        </View>
    );
}