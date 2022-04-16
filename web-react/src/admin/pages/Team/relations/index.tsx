import React from 'react'
import { MutationFunction } from '@apollo/client'
import { useStyles } from '../../commonComponents/styled'

import { Membership } from './components/Membership'
import { Players } from './components/players'
import { Sponsors } from './components/Sponsors'
import { Jerseys } from './components/Jerseys'
import { Positions } from './components/Positions'
import { Occupations } from './components/Occupations'
import { Persons } from './components/persons'

import { Team } from 'utils/types'

type TRelations = {
  teamId: string
  updateTeam: MutationFunction
  team: Team
}
const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
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
