import React from 'react'
import { Award } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Competitions } from './components/Competitions'
import { Games } from './components/Games'
import { Groups } from './components/Groups'
import { Persons } from './components/Persons'
import { Phases } from './components/Phases'
import { Players } from './components/Players'
import { Seasons } from './components/Seasons'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Venues } from './components/Venues'

type TRelations = {
  awardId: string
  award: Award
  updateAward: MutationFunction
}

const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
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
