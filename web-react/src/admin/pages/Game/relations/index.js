import React from 'react'
import PropTypes from 'prop-types'
import { useStyles } from '../../commonComponents/styled'

import { Teams } from './components/Teams'

const Relations = props => {
  const { gameId, teams } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams gameId={gameId} teams={teams} />
    </div>
  )
}

Relations.propTypes = { teamId: PropTypes.string, teams: PropTypes.array }

export { Relations }
