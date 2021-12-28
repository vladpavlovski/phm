import React from 'react'

import { useStyles } from '../../commonComponents/styled'
import { Sponsors } from './components/Sponsors'
import { Teams } from './components/Teams'
import { Competitions } from './components/Competitions'
import { RulePacks } from './components/RulePacks'
import { Occupations } from './components/Occupations'
import { Persons } from './components/persons'
import { Organization } from 'utils/types'

type TRelations = {
  organizationId: string
  organization: Organization
}
const Relations: React.FC<TRelations> = props => {
  const { organizationId, organization } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Persons organizationId={organizationId} organization={organization} />
      <Sponsors organizationId={organizationId} />
      <Teams organizationId={organizationId} />
      <Competitions organizationId={organizationId} />
      <RulePacks organizationId={organizationId} />
      <Occupations organizationId={organizationId} />
    </div>
  )
}

export { Relations }
