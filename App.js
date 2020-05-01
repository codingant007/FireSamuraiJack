/**
 * App to interact with Firebase and fetch data at realtime
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Platform, StyleSheet, Text, TextInput, View, Button, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen, SetPlayerDetailsScreen, DealerGameStartScreen, PlayerJoinGameScreen, GamePlayScreen } from './app/Screens';

import firebase from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import { PlayerContextProvider } from './app/PlayerContextProvider';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\nCmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\nShake or press menu button for dev menu',
});

const firebaseCredentials = Platform.select({
  ios: 'https://invertase.link/firebase-ios',
  android: 'https://invertase.link/firebase-android',
});

const realtimeDataReference = database().ref('/testkey');

const Stack = createStackNavigator();

type Props = {};

function onFirebaseUpdate(callback) {
  realtimeDataReference.on('value', snapshot => {
    console.log('Realtime data: ', snapshot.val());
    callback(snapshot.val());
  });
}

function writeToFirebase(data) {
  realtimeDataReference.set(data);
}

export default class App extends Component<Props> {
  constructor(props) {
    super(props); 
    this.state = {
      realtimedata: null,
      updatedata: null
    }
  }

  render() {
    return (
      <PlayerContextProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'HomeScreen' }} />
            <Stack.Screen name="SetPlayerDetailsScreen" component={SetPlayerDetailsScreen} />
            <Stack.Screen name="DealerGameStartScreen" component={DealerGameStartScreen} />
            <Stack.Screen name="PlayerJoinGameScreen" component={PlayerJoinGameScreen} />
            <Stack.Screen name="GamePlayScreen" component={GamePlayScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </PlayerContextProvider>
    );
  }
}

const styles = StyleSheet.create({
  textinput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1
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
    padding: 10
  },
  buttonText: {
    textAlign: 'center',
    padding: 20,
    color: 'white'
  },
});
