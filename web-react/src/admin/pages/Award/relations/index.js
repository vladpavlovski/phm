import React from 'react'

import { useStyles } from '../../commonComponents/styled'
import { Seasons } from './components/Seasons'
import { Competitions } from './components/Competitions'
import { Phases } from './components/Phases'
import { Groups } from './components/Groups'
import { Teams } from './components/Teams'
import { Games } from './components/Games'
import { Players } from './components/Players'
import { Persons } from './components/Persons'
import { Venues } from './components/Venues'
import { Stars } from './components/Stars'
import { Sponsors } from './components/Sponsors'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Seasons {...props} />
      <Competitions {...props} />
      <Phases {...props} />
      <Groups {...props} />
      <Teams {...props} />
      <Games {...props} />
      <Players {...props} />
      <Persons {...props} />
      <Venues {...props} />
      <Stars {...props} />
      <Sponsors {...props} />
    </div>
  )
}

export { Relations }
