import React, { useContext, useState } from 'react';

import { GameContextProvider, GameContext } from "../GameContextProvider";
import { Header, Content, Body, Footer, FooterTab, Button, Icon, Text, Badge, Left, Right, Title, Subtitle, List, ListItem, Grid, Row } from 'native-base';
import { PlayerContext } from '../PlayerContextProvider';

import { DealerScreen } from './DealerScreen';
import { HandScreen } from './HandScreen';
import { PlayerPool } from './PlayerPoolScreen';
import { PlayersScreen } from './PlayersScreen';

export function GamePlayScreen({ route, navigation }) {
    console.log("Route params: " + JSON.stringify(route.params));
    const [footerState, setFooterState] = useState(FOOTER_STATES.HAND);
    console.log("footerState: ", footerState);
    return (
        <GameContextProvider gameCode={route.params.gameCode}>
            <GamePlayHeader navigation={navigation} />
            <Content padder>
                <GamePlayContent footerState={footerState} />
            </Content>
            <Footer>
                <FooterTab>
                    <Button vertical
                        active={footerState === FOOTER_STATES.HAND}
                        onPress={() => setFooterState(FOOTER_STATES.HAND)}
                    >
                        <Icon name="hand" />
                        <Text>Hand</Text>
                    </Button>
                    <Button vertical
                        active={footerState === FOOTER_STATES.POOL}
                        onPress={() => setFooterState(FOOTER_STATES.POOL)}
                    >
                        <Icon name="cart" />
                        <Text>Pool</Text>
                    </Button>
                    <Button vertical
                        active={footerState === FOOTER_STATES.DEALER}
                        onPress={() => setFooterState(FOOTER_STATES.DEALER)}
                    >
                        <Icon name="eye" />
                        <Text>Dealer</Text>
                    </Button>
                    <Button vertical
                        active={footerState === FOOTER_STATES.PLAYERS}
                        onPress={() => setFooterState(FOOTER_STATES.PLAYERS)}
                    >
                        <Icon name="people" />
                        <Text>Players</Text>
                    </Button>
                </FooterTab>
            </Footer>
        </GameContextProvider>
    );
}

const FOOTER_STATES = {
    HAND: "Hand",
    POOL: "Pool",
    DEALER: "Dealer",
    PLAYERS: "Players"
}

function GamePlayContent({ footerState }) {
    console.log("Game play content, state: " + JSON.stringify(footerState));

    switch (footerState) {
        case FOOTER_STATES.HAND:
            return (<HandScreen />);
        case FOOTER_STATES.POOL:
            return (<PlayerPool />);
        case FOOTER_STATES.DEALER:
            return (<DealerScreen />);
        case FOOTER_STATES.PLAYERS:
            return <PlayersScreen />;
        default:
            return null;
    }
}

function GamePlayHeader({ navigation }) {
    const { playerName, isDealer } = useContext(PlayerContext);

    return (<Header>
        <Body>
            <Left>
                <Title>Deck of cards</Title>
                <Subtitle>Player: {playerName} {isDealer ? <Icon name="eye" /> : null}</Subtitle>
            </Left>
        </Body>
        <Right>
            <Button onPress={() => navigation.navigate('HomeScreen')}>
                <Icon name="exit" />
                <Text>Leave</Text>
            </Button>
        </Right>
    </Header>)
}
