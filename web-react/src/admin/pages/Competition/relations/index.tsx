import React from 'react'

import { useStyles } from '../../commonComponents/styled'
import { Organization } from './components/Organization'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Seasons } from './components/Seasons'
import { Venues } from './components/Venues'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Competition } from 'utils/types'
import { MutationFunction } from '@apollo/client'

type TRelations = {
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Organization {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Seasons {...props} />
      <Venues {...props} />
      <Sponsors {...props} />
      <Teams {...props} />
    </div>
  )
}

export { Relations }
