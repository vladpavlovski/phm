import React, { useState } from 'react'
import PropTypes from 'prop-types'
import TeamPlayersContext, { initialContextState } from './index'

const TeamPlayersProvider = props => {
  const [playerPositionDialogOpen, setPlayerPositionDialogOpen] = useState(
    initialContextState.playerPositionDialogOpen
  )
  const [playerJerseyDialogOpen, setPlayerJerseyDialogOpen] = useState(
    initialContextState.playerJerseyDialogOpen
  )

  const [playerData, setPlayerData] = useState(null)

  return (
    <TeamPlayersContext.Provider
      value={{
        playerPositionDialogOpen,
        setPlayerPositionDialogOpen,
        playerJerseyDialogOpen,
        setPlayerJerseyDialogOpen,
        playerData,
        setPlayerData,
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
