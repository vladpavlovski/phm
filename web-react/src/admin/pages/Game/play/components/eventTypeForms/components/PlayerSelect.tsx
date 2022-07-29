import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import React from 'react'
import { GamePlayersRelationship } from 'utils/types'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  players: GamePlayersRelationship[]
  onClick: (p: GamePlayersRelationship) => void
  selected?: GamePlayersRelationship
  title?: string
  disabled?: GamePlayersRelationship
}

const PlayerSelect: React.FC<Props> = ({
  players,
  onClick,
  selected,
  title,
  disabled,
}) => {
  return (
    <div>
      <TitleDivider title={title} />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          minWidth: 300,
          width: '100%',
          justifyContent: 'space-evenly',
        }}
      >
        {players
          .sort((a, b) => (a.jersey && b.jersey ? a.jersey - b.jersey : 0))
          .map(p => (
            <Button
              type="button"
              size="large"
              sx={{ width: '15%', m: 1 }}
              key={p.node.playerId}
              variant={selected?.jersey === p.jersey ? 'outlined' : 'contained'}
              color="primary"
              onClick={() => {
                onClick(p)
              }}
              disabled={disabled?.node?.playerId === p.node.playerId}
            >
              <Typography variant="h5" component="div" sx={{ marginRight: 1 }}>
                {p.jersey || ''}
              </Typography>
              <Typography variant="body1" component="div">
                {p.node?.lastName}
              </Typography>
            </Button>
          ))}
      </div>
    </div>
  )
}

const getPlayerObject = ({
  player,
  playerTitle,
  playerToCheck,
}: {
  player?: GamePlayersRelationship
  playerTitle: string
  playerToCheck?: GamePlayersRelationship
}) => {
  return {
    [playerTitle]: player
      ? player.node?.playerId === playerToCheck?.node.playerId
        ? undefined
        : player
      : undefined,
  }
}

export { PlayerSelect, getPlayerObject }
