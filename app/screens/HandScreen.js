import React, { useContext } from 'react';

import { GameContext } from "../GameContextProvider";
import { Icon, Text, Left, Right, List, ListItem, Grid, Row, Button, ActionSheet, Root, View, Content } from 'native-base';
import { PlayerContext } from '../PlayerContextProvider';
import { CardStatus, PLAYER_ACTIONS } from '../Game';

export function HandScreen() {
    return (
        <Grid>
            <Row size={1} style={{ height: 200 }}>
                <Pool />
            </Row>
            <Row size={1} style={{  }}>
                <PlayerHand />
            </Row>
        </Grid>
    );
}

function Pool() {
    const { deckState } = useContext(GameContext);
    const cardsInPool = Object.values(deckState.cards)
        .filter((card) => card.status == CardStatus.POOL);

    return (
        <Content style={{borderWidth: 2}}>
            <ListItem itemHeader first>
                <Text>Cards in common pool</Text>
            </ListItem>
            <List
                dataArray={cardsInPool}
                renderRow={card =>
                    <ListItem>
                        <Left>
                            <Text>
                                {card.id}
                            </Text>
                        </Left>
                        <Right>
                            <Icon name="arrow-forward" />
                        </Right>
                    </ListItem>
                }
            />
        </Content>
    )
}

function PlayerHand() {
    const { playerName } = useContext(PlayerContext);
    const { deckState } = useContext(GameContext);

    const cardsInPlayerHand = Object.values(deckState.cards)
        .filter((card) => card.status == CardStatus.HAND && card.playerName == playerName);
    return (
        <Content style={{borderWidth: 2}} >
            <ListItem itemHeader first>
                <Text>Your Hand</Text>
            </ListItem>
            <List
                dataArray={cardsInPlayerHand}
                renderRow={card =>
                    <ListItem>
                        <Left>
                            <CardActionPicker card={card} />
                        </Left>
                    </ListItem>}
            />
        </Content>
    )
}

function CardActionPicker({ card }) {
    const { playerName, isDealer } = useContext(PlayerContext);
    const { gameCode, dispatchDeckAction } = useContext(GameContext);

    const actions = [PLAYER_ACTIONS.PLAY_CARD];
    const options = actions.map(action => { return { text: action } });
    options.push({ text: "Cancel", icon: "close" });
    return (
        <Root>
            <Button
                onPress={() =>
                    ActionSheet.show(
                        {
                            options: options,
                            cancelButtonIndex: actions.length,
                            title: "What do you want to do with this card? " + card.id
                        },
                        buttonIndex => {
                            if (buttonIndex >= actions.length) {
                                return;
                            }
                            dispatchDeckAction({
                                type: actions[buttonIndex],
                                payload: {
                                    gameCode: gameCode,
                                    player: { playerName, isDealer },
                                    card: card
                                }
                            })
                        }
                    )}
            >
                <Text>
                    {card.id}
                </Text>
            </Button>
        </Root>
    );
}