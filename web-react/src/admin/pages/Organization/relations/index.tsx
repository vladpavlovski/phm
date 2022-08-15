import React from 'react'
import { Organization } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import { Competitions } from './components/Competitions'
import { Occupations } from './components/Occupations'
import { Persons } from './components/persons'
import { RulePacks } from './components/RulePacks'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'

type TRelations = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  return (
    <div style={{ paddingTop: '16px' }}>
      <Persons {...props} />
      <Sponsors {...props} />
      <Teams {...props} />
      <Competitions {...props} />
      <RulePacks {...props} />
      <Occupations {...props} />
    </div>
  )
}

export { Relations }
