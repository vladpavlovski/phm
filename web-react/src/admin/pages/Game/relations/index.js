import React from 'react'
import PropTypes from 'prop-types'
import { useStyles } from '../../commonComponents/styled'

import { Teams } from './components/Teams'
import { Lineups } from './components/lineups/Lineups'
import { Membership } from './components/Membership'

const Relations = props => {
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Membership {...props} />
      <Teams {...props} />
      <Lineups {...props} />
    </div>
  )
}

Relations.propTypes = { teamId: PropTypes.string, teams: PropTypes.array }

export { Relations }
