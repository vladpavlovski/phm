import React from 'react'

const initialContextState = {
  gameEventForm: {
    nextButtonDisabled: false,
  },
}
const GameEventFormContext = React.createContext(initialContextState)
export { initialContextState, GameEventFormContext as default }
