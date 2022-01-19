import React from 'react'
import { useStyles } from '../../commonComponents/styled'
import { MutationFunction } from '@apollo/client'
import { Teams } from './components/Teams'
import { Lineups } from './components/lineups/Lineups'
import { Membership } from './components/Membership'
import { Team, Game, Player } from 'utils/types'

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
  const { gameId, teams } = props

  return (
    <div className={classes.accordionWrapper}>
      <Membership {...props} />
      <Teams gameId={gameId} teams={teams} />
      <Lineups {...props} />
    </div>
  )
}

export { Relations }
