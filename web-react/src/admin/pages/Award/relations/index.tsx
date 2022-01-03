import React from 'react'
import { MutationFunction } from '@apollo/client'
import { useStyles } from '../../commonComponents/styled'
import { Seasons } from './components/Seasons'
import { Competitions } from './components/Competitions'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Teams } from './components/Teams'
import { Games } from './components/Games'
import { Players } from './components/Players'
import { Persons } from './components/Persons'
import { Venues } from './components/Venues'
import { Sponsors } from './components/Sponsors'
import { Award } from 'utils/types'

type TRelations = {
  awardId: string
  award: Award
  updateAward: MutationFunction
}

const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Seasons {...props} />
      <Competitions {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Teams {...props} />
      <Games {...props} />
      <Players {...props} />
      <Persons {...props} />
      <Venues {...props} />
      <Sponsors {...props} />
    </div>
  )
}

export { Relations }
