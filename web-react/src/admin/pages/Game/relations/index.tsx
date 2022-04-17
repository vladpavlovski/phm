import React from 'react'
import { Game, Player, Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { useStyles } from '../../commonComponents/styled'
import { Lineups } from './components/lineups/Lineups'
import { Membership } from './components/Membership'
import { Teams } from './components/Teams'

type TRelations = {
  gameId: string
  teams: {
    host: boolean
    node: Team
  }[]
  players: {
    node: Player
    host: boolean
  }[]
  gameData: Game
  updateGame: MutationFunction
}

const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Membership {...props} />
      <Teams {...props} />
      <Lineups {...props} />
    </div>
  )
}

export { Relations }
