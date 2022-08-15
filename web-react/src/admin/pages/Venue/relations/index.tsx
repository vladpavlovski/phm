import React from 'react'
import { Venue } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Competitions } from './components/Competitions'
import { Groups } from './components/Groups'
import { Phases } from './components/Phases'
import { Seasons } from './components/Seasons'

type TRelations = {
  venueId: string
  updateVenue: MutationFunction
  venue: Venue
}

const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <Competitions {...props} />
      <Seasons {...props} />
      <Phases {...props} />
      <Groups {...props} />
    </div>
  )
}

export { Relations }
