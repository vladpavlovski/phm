import React, { useState } from 'react'
import PropTypes from 'prop-types'
import OrganizationPersonsContext, { initialContextState } from './index'

const OrganizationPersonsProvider = props => {
  const [personOccupationDialogOpen, setPersonOccupationDialogOpen] = useState(
    initialContextState.personOccupationDialogOpen
  )

  const [personData, setPersonData] = useState(null)

  return (
    <OrganizationPersonsContext.Provider
      value={{
        personOccupationDialogOpen,
        setPersonOccupationDialogOpen,
        personData,
        setPersonData,
      }}
    >
      {props.children}
    </OrganizationPersonsContext.Provider>
  )
}

OrganizationPersonsProvider.propTypes = {
  children: PropTypes.node,
}

export { OrganizationPersonsProvider }
