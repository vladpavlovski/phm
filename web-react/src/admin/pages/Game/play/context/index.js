import React from 'react'

const initialContextState = {
  gameEventForm: {
    nextButtonDisabled: false,
  },
  period: null,
  time: '00:00',
}
const GameEventFormContext = React.createContext(initialContextState)
export { initialContextState, GameEventFormContext as default }
