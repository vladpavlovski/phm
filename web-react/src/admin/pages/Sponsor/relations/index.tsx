import React from 'react'
import { MutationFunction } from '@apollo/client'
import { useStyles } from '../../commonComponents/styled'
import { Teams } from './components/Teams'
import { Players } from './components/Players'
import { Awards } from './components/Awards'
import { Competitions } from './components/Competitions'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Sponsor } from 'utils/types'

type TRelations = {
  sponsorId: string
  sponsor: Sponsor
  updateSponsor: MutationFunction
}
const Relations: React.FC<TRelations> = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams {...props} />
      <Players {...props} />
      <Awards {...props} />
      <Competitions {...props} />
      <Phases {...props} />
      <Groups {...props} />
    </div>
  )
}

export { Relations }
