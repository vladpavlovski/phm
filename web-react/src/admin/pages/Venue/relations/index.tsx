import React from 'react'
import { MutationFunction } from '@apollo/client'
import { useStyles } from '../../commonComponents/styled'
import { Competitions } from './components/Competitions'
import { Seasons } from './components/Seasons'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Venue } from 'utils/types'

type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Competitions {...props} />
      <Seasons {...props} />
      <Phases {...props} />
      <Groups {...props} />
    </div>
  )
}

export { Relations }
