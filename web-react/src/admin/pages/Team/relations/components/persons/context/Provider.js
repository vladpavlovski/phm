import React, { useState } from 'react'
import PropTypes from 'prop-types'
import TeamPersonsContext, { initialContextState } from './index'

const TeamPersonsProvider = props => {
  const [personOccupationDialogOpen, setPersonOccupationDialogOpen] = useState(
    initialContextState.personOccupationDialogOpen
  )

  const [personData, setPersonData] = useState(null)

  return (
    <TeamPersonsContext.Provider
      value={{
        personOccupationDialogOpen,
        setPersonOccupationDialogOpen,
        personData,
        setPersonData,
      }}
    >
      {props.children}
    </TeamPersonsContext.Provider>
  )
}

TeamPersonsProvider.propTypes = {
  children: PropTypes.node,
}

export { TeamPersonsProvider }
