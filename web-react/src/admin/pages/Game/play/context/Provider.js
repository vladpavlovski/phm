import React from 'react'
import PropTypes from 'prop-types'

import GameEventFormContext, { initialContextState } from './index'

const GameEventFormProvider = props => {
  const [nextButtonDisabled, setNextButtonDisabled] = React.useState(
    initialContextState.gameEventForm.nextButtonDisabled
  )
  return (
    <GameEventFormContext.Provider
      value={{
        nextButtonDisabled,
        setNextButtonDisabled,
      }}
    >
      {props.children}
    </GameEventFormContext.Provider>
  )
}

GameEventFormProvider.propTypes = {
  children: PropTypes.node,
}

export { GameEventFormProvider }
