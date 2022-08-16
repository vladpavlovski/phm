import { Organization } from 'admin/pages/entity/relations/Organization'
import React from 'react'
import { Season } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Competitions } from './components/Competitions'
import { Groups } from './components/Groups'
import { Phases } from './components/Phases'
import { Teams } from './components/Teams'
import { Venues } from './components/Venues'

type TRelations = {
  seasonId: string
  updateSeason: MutationFunction
  season: Season
}

const Relations: React.FC<TRelations> = props => {
  const { seasonId, season, updateSeason } = props
  return (
    <div style={{ paddingTop: '16px' }}>
      <Organization
        entityType="season"
        update={updateSeason}
        targetId={seasonId}
        entity={season}
      />
      <Competitions {...props} />
      <Teams {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Venues {...props} />
    </div>
  )
}

export { Relations }
