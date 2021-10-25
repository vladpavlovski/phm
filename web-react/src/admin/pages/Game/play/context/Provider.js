import React from 'react'
import PropTypes from 'prop-types'

import GameEventFormContext, { initialContextState } from './index'

const GameEventFormProvider = props => {
  const [nextButtonDisabled, setNextButtonDisabled] = React.useState(
    initialContextState.gameEventForm.nextButtonDisabled
  )

  const tempRemainingTime = React.useRef('00:00')

  const setTempRemainingTime = React.useCallback(remTime => {
    tempRemainingTime.current = remTime
  }, [])

  // will need to be reset after every game play
  const [period, setPeriod] = React.useState(initialContextState.period)
  const [time, setTime] = React.useState(initialContextState.time)
  const [eventsTableUpdate, setEventsTableUpdate] = React.useState(0)

  const [openGameEventDialog, setOpenGameEventDialog] = React.useState(false)
  const [gameEventSettings, setGameEventSettings] = React.useState()
  const [gameEventData, setGameEventData] = React.useState()
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
        openGameEventDialog,
        setOpenGameEventDialog,
        gameEventSettings,
        setGameEventSettings,
        gameEventData,
        setGameEventData,
        tempRemainingTime,
        setTempRemainingTime,
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
