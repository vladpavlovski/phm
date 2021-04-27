import React from 'react'

const initialContextState = {
  personOccupationDialogOpen: false,
}
const TeamPersonsContext = React.createContext(initialContextState)
export { initialContextState, TeamPersonsContext as default }
