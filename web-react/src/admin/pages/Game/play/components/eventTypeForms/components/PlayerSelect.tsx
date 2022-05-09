import React from 'react'
import { GamePlayersRelationship } from 'utils/types'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

type Props = {
  players: GamePlayersRelationship[]
  onClick: (p: GamePlayersRelationship) => void
  selected: GamePlayersRelationship | null
}

const PlayerSelect: React.FC<Props> = React.memo(props => {
  const { players, onClick, selected } = props
  return (
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
            style={{ width: '15%', marginBottom: '2rem' }}
            key={p.node.playerId}
            variant={selected?.jersey === p.jersey ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => {
              onClick(p)
            }}
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
  )
})

export { PlayerSelect }
