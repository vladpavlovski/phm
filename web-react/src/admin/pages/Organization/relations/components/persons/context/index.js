import React from 'react'

const initialContextState = {
  personOccupationDialogOpen: false,
}
const OrganizationPersonsContext = React.createContext(initialContextState)
export { initialContextState, OrganizationPersonsContext as default }
