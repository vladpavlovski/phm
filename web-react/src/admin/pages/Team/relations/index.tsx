import React from 'react'
import { Team } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Jerseys } from './components/Jerseys'
import { Membership } from './components/Membership'
import { Occupations } from './components/Occupations'
import { Persons } from './components/persons'
import { Players } from './components/players'
import { Positions } from './components/Positions'
import { Sponsors } from './components/Sponsors'

type TRelations = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <Membership {...props} />
      <Players {...props} />
      <Jerseys {...props} />
      <Positions {...props} />
      <Occupations {...props} />
      <Persons {...props} />
      <Sponsors {...props} />
    </div>
  )
}

export { Relations }
