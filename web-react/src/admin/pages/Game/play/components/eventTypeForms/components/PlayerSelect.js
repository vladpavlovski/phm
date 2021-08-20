import React from 'react'
import Button from '@material-ui/core/Button'

const PlayerSelect = props => {
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
            style={{ width: '10%' }}
            key={p.node.playerId}
            variant={selected?.jersey === p.jersey ? 'outlined' : 'contained'}
            color="primary"
            onClick={() => {
              onClick(p)
            }}
          >
            {p.jersey || 'not defined'}
          </Button>
        )
      })}
    </div>
  )
}

export { PlayerSelect }
