import { StyleSheet, View, Button, Text, TextInput, Modal, FlatList, TouchableHighlight } from "react-native";

import React, { useState, useEffect, useContext, useRef } from 'react';
import { PlayerContext } from "./PlayerContextProvider";
import { PlayerName } from "./PlayerName";
import { GameContextProvider, GameContext } from "./GameContextProvider";
import { CardStatus, DEALER_ACTIONS, PLAYER_ACTIONS } from "./Game";
import RBSheet from "react-native-raw-bottom-sheet";


function HomeScreen({ navigation, route }) {
  const { playerName } = useContext(PlayerContext);
  const [isGamingEnabeld, setIsGamingEnabled] = useState(false);

  useEffect(() => {
    // Only enable gaming after if player name is set.
    if (playerName) {
      console.log("PlayerName: " + playerName)
      setIsGamingEnabled(true);
    }
  })

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PlayerName />
      <Button
        onPress={() => navigation.navigate('SetPlayerDetailsScreen')}
        title="Set Player Details"
      />
      <Button
        disabled={!isGamingEnabeld}
        onPress={() => navigation.navigate('DealerGameStartScreen')}
        title="Start Game"
      />
      <Button
        disabled={!isGamingEnabeld}
        onPress={() => navigation.navigate('PlayerJoinGameScreen')}
        title="Join Game"
      />
    </View>
  )
}

function SetPlayerDetailsScreen({ route, navigation }) {
  const { playerName, setPlayerName } = useContext(PlayerContext);
  return (
    <View style={styles.container}>
      <Text>Enter player name: </Text>
      <TextInput
        style={styles.textinput}
        onChangeText={setPlayerName}
        value={playerName}
      />
      <Button
        onPress={() => navigation.goBack()}
        title="Save"
      />
    </View>
  );
}

function DealerGameStartScreen({ route, navigation }) {
  // TODO: Validate playername and game code
  const { setIsDealer } = useContext(PlayerContext)
  const [gameCode, setGameCode] = useState("GUYFAWKS");

  return (
    <View style={{ flex: 1, justifyContent: 'center' }}>
      <PlayerName />
      <TextInput
        style={styles.textinput}
        onChangeText={setGameCode}
        defaultValue="GUYFAWKS"
      />
      <Button
        onPress={() => {
          setIsDealer(true);
          navigation.navigate('GamePlayScreen', { gameCode });
        }}
        title="Start Game"
      />
    </View>
  );
}

function PlayerJoinGameScreen({ route, navigation }) {
  // TODO: Validate playername and game code
  const { setIsDealer } = useContext(PlayerContext)
  const [gameCode, setGameCode] = useState("GUYFAWKS");

  return (
    <View style={styles.container}>
      <PlayerName />
      <TextInput
        style={styles.textinput}
        onChangeText={setGameCode}
        defaultValue="GUYFAWKS"
      />
      <Button
        onPress={() => {
          setIsDealer(false);
          console.log("A: " + gameCode);
          navigation.navigate('GamePlayScreen', { gameCode });
        }}
        title="Join Game"
      />
    </View>
  );
}

function GamePlayScreen({ route, navigation }) {
  console.log("Route params: " + JSON.stringify(route.params));
  return (
    <GameContextProvider gameCode={route.params.gameCode}>
      <View style={styles.container}>
        <PlayerName />
        <DealerGamePlayArea route={route} navigation={navigation} />
        <PlayerGamePlayArea route={route} navigation={navigation} />
        <Button
          onPress={() => navigation.navigate('HomeScreen')}
          title="Exit Game"
        />
      </View>
    </GameContextProvider>
  );
}

function DealerGamePlayArea({ route, navigation }) {
  const { gameCode, dispatchDeckAction, groupState } = useContext(GameContext);
  const { isDealer } = useContext(PlayerContext);

  if (!isDealer) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Button
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.SHUFFLE_CARDS,
            payload: {
              gameCode: gameCode,
              groupState: groupState
            }
          })}
        title="Shuffle cards"
      />
      <Button
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.DISTRIBUTE_CARDS,
            payload: {
              gameCode: gameCode,
              groupState: groupState
            }
          })}
        title="Distribute cards"
      />
      <Button
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.COLLECT_CARDS,
            payload: {
              gameCode: gameCode,
            }
          })}
        title="Collect cards"
      />
      <Button
        onPress={() => dispatchDeckAction(
          {
            type: DEALER_ACTIONS.RESET_GAME,
            payload: {
              gameCode: gameCode,
            }
          })}
        title="Reset game"
      />
    </View>
  );
}

function PlayerGamePlayArea({ route, navigation }) {
  return (
    <View style={styles.container}>
      <Group />
      <Pool />
      <PlayerHand />
    </View>
  );
}

function Group() {
  const { groupState } = useContext(GameContext);
  console.log(JSON.stringify(groupState));

  if (groupState) {
    return (
      <View style={styles.container}>
        <Text>Players in the game: </Text>
        {Object.values(groupState).map((player, i) => (
          <Player player={player} />
        ))}
      </View>
    )
  }
  return null;
}

function Player({ player }) {
  // TODO: Make this more sophisticated instead of just a text. Avatar, icon for indicating a dealer, numCards badge etc.
  const { deckState } = useContext(GameContext);
  const playerNameText = player.playerName;
  const isDealerText = player.isDealer ? "(Dealer)" : "";
  console.log("Player tag deckState: " + deckState);
  const displayText = playerNameText + " " + getNumCardsInHand(player, deckState.cards) + " " + isDealerText;
  return (
    <Text>{displayText}</Text>
  );
}

function getNumCardsInHand(player, cards) {
  return Object.values(cards)
    .filter((card) => card.playerName === player.playerName)
    .length;
}

function ActionList({ card }) {
  const { gameCode, dispatchDeckAction } = useContext(GameContext);
  const { playerName, isDealer } = useContext(PlayerContext);
  const actions = [PLAYER_ACTIONS.PLAY_CARD];
  if (card) {
    return (<FlatList
      keyExtractor={(_, index) => index.toString()}
      data={actions}
      renderItem={({ item, index }) => (
        <TouchableHighlight
          key={index}
          onPress={() => dispatchDeckAction(
            {
              type: item,
              payload: {
                gameCode: gameCode,
                player: { playerName: playerName, isDealer: isDealer },
                card: card
              }
            }
          )}
        >
          <View style={{ backgroundColor: 'green', flexDirection: 'row', flex: 1 }}>
            <Text> CardId: {card.id}, Action: {item}</Text>
          </View>
        </TouchableHighlight>
      )}
    />)
  }
  return null;
}

function ActionInput({ bottomSheetRef, actionCard, actions }) {
  return (
    <RBSheet
      ref={bottomSheetRef}
      closeOnDragDown={true}
      closeOnPressMask={false}
      customStyles={{
        wrapper: {
          backgroundColor: "transparent"
        },
        draggableIcon: {
          backgroundColor: "#000"
        }
      }}
    >
      <Button title="CLOSE BOTTOM SHEET" onPress={() => bottomSheetRef.current.close()} />
      <ActionList card={actionCard} />
    </RBSheet>
  )
}

function Pool() {
  const { deckState } = useContext(GameContext);

  // TODO: Change type to POOL after testing UI.
  console.log("Pool tag deckState: " + deckState);
  const cardsInPool = Object.values(deckState.cards).filter((card) => card.status == CardStatus.POOL);
  console.log(cardsInPool);
  return (
    <View style={styles.listcontainer}>
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        data={cardsInPool}
        renderItem={({ item, index }) => (
          <Text key={index}>CardID: {item.id} CardStatus: {item.status}</Text>
        )}
      />
    </View>
  )
}

function PlayerHand() {
  const { playerName } = useContext(PlayerContext);
  const { deckState } = useContext(GameContext);
  const bottomSheetRef = useRef();
  const [actionCard, setActionCard] = useState();

  // TODO: Change type to HAND after testing UI.
  console.log("PlayerHand tag deckState: " + deckState);
  const cardsInPlayerHand = Object.values(deckState.cards).filter((card) => card.status == CardStatus.HAND && card.playerName == playerName);
  console.log("CardsInPlayerHand: " + JSON.stringify(cardsInPlayerHand));
  return (
    <View style={styles.container}>
      <ActionInput bottomSheetRef={bottomSheetRef} actionCard={actionCard} />
      <FlatList
        keyExtractor={(_, index) => index.toString()}
        data={cardsInPlayerHand}
        renderItem={({ item, index }) => (
          <View>
            <TouchableHighlight
              key={index}
              onPress={() => { setActionCard(item); bottomSheetRef.current.open(); }}>
              <View style={{ backgroundColor: 'green', flexDirection: 'row', flex: 1 }}>
                <Text>Card: {item.id}, Index: {index}</Text>
              </View>
            </TouchableHighlight>
          </View>
        )}
      />
    </View>
  )
}

export { HomeScreen, SetPlayerDetailsScreen, DealerGameStartScreen, PlayerJoinGameScreen, GamePlayScreen };

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  textinput: {
    height: 40,
    width: 200,
    borderColor: 'gray',
    borderWidth: 1
  },
  listcontainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'powderblue',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#DDDDDD",
    padding: 10,
    width: 100,
    height: 40
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  },
});