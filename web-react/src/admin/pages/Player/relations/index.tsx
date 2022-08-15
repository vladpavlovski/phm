import React from 'react'
import { Player } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Jerseys } from './components/Jerseys'
import { Positions } from './components/Positions'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'

type TRelations = {
  playerId: string
  player: Player
  updatePlayer: MutationFunction
}

const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <Teams {...props} />
      <Positions {...props} />
      <Jerseys {...props} />
      <Sponsors {...props} />
    </div>
  )
}

export { Relations }
