import React from 'react'
import PropTypes from 'prop-types'

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
  const { awardId } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Seasons awardId={awardId} />
      <Competitions awardId={awardId} />
      <Phases awardId={awardId} />
      <Groups awardId={awardId} />
      <Teams awardId={awardId} />
      <Games awardId={awardId} />
      <Players awardId={awardId} />
      <Persons awardId={awardId} />
      <Venues awardId={awardId} />
      <Stars awardId={awardId} />
      <Sponsors awardId={awardId} />
    </div>
  )
}

Relations.propTypes = { awardId: PropTypes.string }

export { Relations }
