import React from 'react'
import { Competition } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Organization } from '../../entity/relations/Organization'
import { Groups } from './components/Groups'
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
  const { competitionId, competition, updateCompetition } = props
  return (
    <div style={{ paddingTop: '16px' }}>
      <Organization
        entityType="competition"
        update={updateCompetition}
        targetId={competitionId}
        entity={competition}
      />
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
