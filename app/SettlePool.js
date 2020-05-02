import React, { useContext } from "react";
import {
    Root,
    Button,
    ActionSheet,
    Text
} from "native-base";
import { GameContext } from "./GameContextProvider";
import { DEALER_ACTIONS } from "./Game";

export function SettlePoolToPlayer() {
    const { gameCode, groupState, dispatchDeckAction } = useContext(GameContext);
    if(!groupState) {
        return null;
    }
    const players = Object.values(groupState);
    const options = players.map(player => { return { text: player.playerName } })
    options.push({ text: "Cancel", icon: "close" });
    return (
        // Why Root tag is required here:
        // https://github.com/GeekyAnts/NativeBase/issues/680#issuecomment-327832298
        <Root>
            <Button style={styles.mb15}
                onPress={() =>
                    ActionSheet.show(
                        {
                            options: options,
                            cancelButtonIndex: players.length,
                            title: "Which player gets the pool?"
                        },
                        buttonIndex => {
                            if(buttonIndex >= players.length) {
                                return;
                            }
                            dispatchDeckAction({
                                type: DEALER_ACTIONS.SETTLE_POOL,
                                payload: {
                                    gameCode: gameCode,
                                    player: players[buttonIndex]
                                }
                            })
                        }
                    )}
            >
                <Text>Settle Pool</Text>
            </Button>
        </Root>
    );
}

const styles = {
    mb15: {
      marginBottom: 15
    }
  }