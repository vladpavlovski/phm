import React from 'react'
import PropTypes from 'prop-types'
import createPersistedState from 'use-persisted-state'

const useGamePlayPeriodState = createPersistedState('HMS-GamePlayPeriod')
import GameEventFormContext, { initialContextState } from './index'

const GameEventFormProvider = props => {
  const [nextButtonDisabled, setNextButtonDisabled] = React.useState(
    initialContextState.gameEventForm.nextButtonDisabled
  )

  // will need to be reset after every game play
  const [period, setPeriod] = useGamePlayPeriodState(initialContextState.period)
  const [time, setTime] = React.useState(initialContextState.time)

  const [eventsTableUpdate, setEventsTableUpdate] = React.useState(0)
  const [goalsEventsCounter, setGoalsEventsCounter] = React.useState(0)
  return (
    <GameEventFormContext.Provider
      value={{
        nextButtonDisabled,
        setNextButtonDisabled,
        period,
        setPeriod,
        time,
        setTime,
        eventsTableUpdate,
        setEventsTableUpdate,
        goalsEventsCounter,
        setGoalsEventsCounter,
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