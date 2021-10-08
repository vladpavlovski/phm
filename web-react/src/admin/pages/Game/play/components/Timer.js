import React, { useState, useEffect, useCallback } from 'react'

import createPersistedState from 'use-persisted-state'
import PropTypes from 'prop-types'
import { useTimer, useTime } from 'react-timer-hook'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { useExitPrompt } from '../../../../../utils/hooks'
const useGamePlayTimer = createPersistedState('HMS-GamePlayTimer')
const useGamePlayTimerRunning = createPersistedState('HMS-GamePlayTimerRunning')

const DEFAULT_TIMER = 1200 // 1200 sec = 20 minutes timer
const Timer = props => {
  const { timeInMinutes } = props
  const [timerStarted, setTimerStarted] = useState(false)
  const [expiryTimestampBase, setExpiryTimestamp] = useGamePlayTimer(
    timeInMinutes || DEFAULT_TIMER
  )
  const [gamePlayTimerRunning, setGamePlayTimerRunning] =
    useGamePlayTimerRunning(false)

  const expiryTimestamp = new Date()
  expiryTimestamp.setSeconds(expiryTimestamp.getSeconds() + expiryTimestampBase)

  const [showExitPrompt, setShowExitPrompt] = useExitPrompt(true, () => {
    setExpiryTimestamp(expiryTimestampBase)
  })

  const { seconds, minutes, isRunning, start, pause, resume, restart } =
    useTimer({
      autoStart: gamePlayTimerRunning,
      expiryTimestamp,
      onExpire: () => console.warn('onExpire called'),
    })

  const {
    seconds: timeSeconds,
    minutes: timeMinutes,
    hours: timeHours,
  } = useTime({ format: '' })

  useEffect(() => {
    setGamePlayTimerRunning(isRunning)
    const restTimer = minutes * 60 + seconds
    setExpiryTimestamp(restTimer)
    return () => {
      setShowExitPrompt(!showExitPrompt)
    }
  }, [isRunning])

  const handleTimerClick = useCallback(() => {
    if (isRunning) {
      pause()
    } else {
      timerStarted ? resume() : start()
      setTimerStarted(true)
    }
  }, [timerStarted, isRunning])

  const handleResetTimer = useCallback(() => {
    setTimerStarted(false)
    setExpiryTimestamp(timeInMinutes || DEFAULT_TIMER)
    setGamePlayTimerRunning(false)
    const time = new Date()
    time.setSeconds(time.getSeconds() + (timeInMinutes || DEFAULT_TIMER))
    restart(time, false)
  }, [])

  return (
    <div style={{ textAlign: 'center', fontFamily: 'Digital Numbers Regular' }}>
      <div style={{ fontSize: '6rem' }}>
        <span>{minutes}</span>:<span>{seconds}</span>
      </div>
      <div style={{ fontSize: '2rem' }}>
        <span>{timeHours}</span>:<span>{timeMinutes}</span>:
        <span>{timeSeconds}</span>
      </div>
      <ButtonGroup
        fullWidth
        variant="outlined"
        aria-label="outlined primary button group"
      >
        <Button onClick={handleTimerClick}>
          {isRunning ? 'Pause' : timerStarted ? 'Resume' : 'Start'}
        </Button>
        <Button onClick={handleResetTimer}>Reset</Button>
      </ButtonGroup>
    </div>
  )
}

Timer.propTypes = {
  timeInMinutes: PropTypes.number,
}

export { Timer }
