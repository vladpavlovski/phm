import React from 'react'
import PropTypes from 'prop-types'
import { useStyles } from '../../commonComponents/styled'

import { Teams } from './components/Teams'
import { Lineups } from './components/lineups/Lineups'

const Relations = props => {
  const { gameId, teams, players } = props
  const classes = useStyles()

  return (
    <div className={classes.accordionWrapper}>
      <Teams gameId={gameId} teams={teams} />
      <Lineups gameId={gameId} teams={teams} players={players} />
    </div>
  )
}

Relations.propTypes = { teamId: PropTypes.string, teams: PropTypes.array }

export { Relations }
