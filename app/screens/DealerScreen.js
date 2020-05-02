import { GameContext } from "../GameContextProvider";
import { PlayerContext } from "../PlayerContextProvider";
import React, { useContext } from "react";
import { Button, Content, Text } from "native-base";
import { SettlePoolToPlayer } from "../SettlePool";
import { DEALER_ACTIONS } from "../Game";

export function DealerScreen() {
  const { gameCode, dispatchDeckAction, groupState } = useContext(GameContext);
  const { isDealer } = useContext(PlayerContext);

  if (!isDealer) {
    return null;
  }

  return (
    <Content padder >
      <Button style={styles.mb15}
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.SHUFFLE_CARDS,
            payload: {
              gameCode: gameCode,
              groupState: groupState
            }
          })}
      >
        <Text>
          Shuffle cards
        </Text>
      </Button>
      <Button style={styles.mb15}
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.DISTRIBUTE_CARDS,
            payload: {
              gameCode: gameCode,
              groupState: groupState
            }
          })}
      >
        <Text>
          Distribute cards
        </Text>
      </Button>
      <SettlePoolToPlayer />
      <Button style={styles.mb15}
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.COLLECT_CARDS,
            payload: {
              gameCode: gameCode,
            }
          })}
      >
        <Text>
          Collect cards
        </Text>
      </Button>
      <Button style={styles.mb15}
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.RESET_GAME,
            payload: {
              gameCode: gameCode,
            }
          })}
      >
        <Text>
          Reset game
        </Text>
      </Button>
    </Content>
  );
}

const styles = {
  mb15: {
    marginBottom: 15
  }
}