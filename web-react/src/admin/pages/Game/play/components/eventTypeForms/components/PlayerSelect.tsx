import React from 'react'
import Button from '@mui/material/Button'
import { GamePlayersRelationship } from 'utils/types'

type TPlayerSelect = {
  players: GamePlayersRelationship[]
  onClick: (p: GamePlayersRelationship) => void
  selected: GamePlayersRelationship | null
}

const PlayerSelect: React.FC<TPlayerSelect> = React.memo(props => {
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
      {players.map(p => {
        return (
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
            {`${p.jersey || ''} - ${p.node?.lastName}`}
          </Button>
        )
      })}
    </div>
  )
})

export { PlayerSelect }
