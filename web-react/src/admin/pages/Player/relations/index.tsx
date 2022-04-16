import React from 'react'
import { useStyles } from '../../commonComponents/styled'
import { MutationFunction } from '@apollo/client'
import { Teams } from './components/Teams'
import { Positions } from './components/Positions'
import { Jerseys } from './components/Jerseys'
import { Sponsors } from './components/Sponsors'
import { Player } from 'utils/types'

type TRelations = {
  playerId: string
  player: Player
  updatePlayer: MutationFunction
}

const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams {...props} />
      <Positions {...props} />
      <Jerseys {...props} />
      <Sponsors {...props} />
    </div>
  )
}

export { Relations }
