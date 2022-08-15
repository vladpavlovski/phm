import React from 'react'
import { Competition } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Groups } from './components/Groups'
import { Organization } from './components/Organization'
import { Phases } from './components/Phases'
import { Seasons } from './components/Seasons'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Venues } from './components/Venues'

type TRelations = {
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
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
