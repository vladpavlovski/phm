import React from 'react'
import { MutationFunction } from '@apollo/client'

import { useStyles } from '../../commonComponents/styled'
import { Competitions } from './components/Competitions'
import { Teams } from './components/Teams'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Venues } from './components/Venues'
import { Season } from 'utils/types'

type TRelations = {
  seasonId: string
  updateSeason: MutationFunction
  season: Season
}

const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Competitions {...props} />
      <Teams {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Venues {...props} />
    </div>
  )
}

export { Relations }
