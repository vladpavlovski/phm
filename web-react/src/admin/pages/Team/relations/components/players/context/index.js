import React from 'react'

const initialContextState = {
  playerPositionDialogOpen: false,
  playerJerseyDialogOpen: false,
}
const TeamPlayersContext = React.createContext(initialContextState)
export { initialContextState, TeamPlayersContext as default }
