import React, { useContext } from 'react';
import { Badge, List, ListItem, Left, Right, Text, Icon, Content, Body } from 'native-base';
import { GameContext } from '../GameContextProvider';

export function PlayersScreen() {
    const { groupState } = useContext(GameContext);
    const players = Object.values(groupState);
    if (groupState) {
        return (
            <List
                dataArray={players}
                renderRow={player => <Player player={player} />}
            />
        )
    }
    return null;
}

function Player({ player }) {
    const { deckState } = useContext(GameContext);
    return (
        <ListItem>
            <Left>
                <Text>
                    {player.playerName}
                </Text>
                {player.isDealer ? <Icon name="eye" /> : null}
            </Left>
            <Right>
                <Badge>
                    <Text>
                        {getNumCardsInHand(player, deckState.cards)}
                    </Text>
                </Badge>
            </Right>
        </ListItem>

    );
}

function getNumCardsInHand(player, cards) {
    return Object.values(cards)
        .filter((card) => card.playerName === player.playerName)
        .length;
}