import React, { useContext } from 'react';

import { GameContext } from "../GameContextProvider";
import { Icon, Text, Left, Right, List, ListItem } from 'native-base';
import { PlayerContext } from '../PlayerContextProvider';
import { CardStatus } from '../Game';

export function PlayerPool() {
    const { playerName } = useContext(PlayerContext);
    const { deckState } = useContext(GameContext);
    const cardsInPlayerPool = Object.values(deckState.cards)
                                    .filter((card) => card.status == CardStatus.PLAYER_POOL && card.playerName == playerName);
    return (
        <List
            dataArray={cardsInPlayerPool}
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
                </ListItem>}
        />
    )
}