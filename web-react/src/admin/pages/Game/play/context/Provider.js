import React from 'react'
import PropTypes from 'prop-types'

import GameEventFormContext, { initialContextState } from './index'

const GameEventFormProvider = props => {
  const [nextButtonDisabled, setNextButtonDisabled] = React.useState(
    initialContextState.gameEventForm.nextButtonDisabled
  )

  const [period, setPeriod] = React.useState(initialContextState.period)
  const [time, setTime] = React.useState(initialContextState.time)
  return (
    <GameEventFormContext.Provider
      value={{
        nextButtonDisabled,
        setNextButtonDisabled,
        period,
        setPeriod,
        time,
        setTime,
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
