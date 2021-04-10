import React, { useState } from 'react'
import PropTypes from 'prop-types'
import TeamPlayersContext, { initialContextState } from './index'

const TeamPlayersProvider = props => {
  const [playerPositionDialogOpen, setPlayerPositionDialogOpen] = useState(
    initialContextState.playerPositionDialogOpen
  )
  const [playerPositionData, setPlayerPositionData] = useState(null)

  return (
    <TeamPlayersContext.Provider
      value={{
        playerPositionDialogOpen,
        setPlayerPositionDialogOpen,
        playerPositionData,
        setPlayerPositionData,
      }}
    >
      {props.children}
    </TeamPlayersContext.Provider>
  )
}

TeamPlayersProvider.propTypes = {
  children: PropTypes.node,
}

export { TeamPlayersProvider }
