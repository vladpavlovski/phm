import React from 'react'
import dayjs from 'dayjs'
import { MutationFunction } from '@apollo/client'
import { useTimer, useTime } from 'react-timer-hook'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ButtonGroup from '@mui/material/ButtonGroup'
import { Prompt } from 'react-router-dom'
// import { GameEventFormContext } from './GameEventWizard'
import { Game } from 'utils/types'

type TTimer = {
  timeInMinutes: number
  gameData: Game
  updateGameResult: MutationFunction
}

const Timer: React.FC<TTimer> = React.memo(props => {
  const { timeInMinutes, gameData, updateGameResult } = props
  // TODO: think about new way of setting time to context
  // const { update } = React.useContext(GameEventFormContext)
  const [timerStarted, setTimerStarted] = React.useState(false)

  const { seconds, minutes, isRunning, start, pause, resume, restart } =
    useTimer({
      autoStart: false,
      expiryTimestamp: dayjs().add(timeInMinutes, 'minute').toDate(),
      // onExpire: () => console.warn('onExpire called'),
    })

  React.useEffect(() => {
    setTimerStarted(false)
    restart(dayjs().add(timeInMinutes, 'minute').toDate(), false)
  }, [timeInMinutes, gameData?.gameResult?.periodActive])

  const handleTimerClick = React.useCallback(() => {
    if (isRunning) {
      pause()
    } else {
      if (!gameData?.gameResult?.gameStartedAt) {
        updateGameResult({
          variables: {
            where: {
              gameResultId: gameData?.gameResult?.gameResultId,
            },
            update: {
              gameStartedAt: dayjs().toISOString(),
            },
          },
        })
      }

      timerStarted ? resume() : start()
      setTimerStarted(true)
    }
  }, [timerStarted, isRunning, start, resume])

  const handleResetTimer = React.useCallback(() => {
    setTimerStarted(false)
    const time = dayjs().add(timeInMinutes, 'minute').toDate()
    restart(time, false)
  }, [timeInMinutes])

  return (
    <div style={{ textAlign: 'center' }}>
      <Prompt when={isRunning} message="Are you sure you want to leave?" />
      {gameData?.gameResult?.periodActive ? (
        <>
          <div
            style={{
              fontSize: '5rem',
              color: getTimerColor(minutes, seconds),
              fontFamily: 'Digital Numbers Regular',
            }}
          >
            {/* {update(state => ({
              ...state,
              tempRemainingTime: `${formatTimeValue(minutes)}:${formatTimeValue(
                seconds
              )}`,
            }))} */}
            <span>{formatTimeValue(minutes)}</span>:
            <span>{formatTimeValue(seconds)}</span>
          </div>
          <Time />
          <ButtonGroup
            fullWidth
            variant="outlined"
            aria-label="outlined primary button group"
            disabled={!gameData?.gameResult?.periodActive}
          >
            <Button onClick={handleTimerClick}>
              {isRunning ? 'Pause' : timerStarted ? 'Resume' : 'Start'}
            </Button>
            <Button onClick={handleResetTimer}>Reset</Button>
          </ButtonGroup>
        </>
      ) : (
        <Box
          sx={{
            display: 'flex',
            placeItems: 'center',
            justifyContent: 'center',
            height: '17rem',
            fontSize: '1.6em',
          }}
        >
          <Typography component="div" variant="h5">
            Select period to see timer
          </Typography>
        </Box>
      )}
    </div>
  )
})

const getTimerColor = (min: number, sec: number): string => {
  if (min === 0 && sec < 30) return 'red'
  return 'inherit'
}

const formatTimeValue = (time: number): string =>
  time < 10 ? `0${time}` : `${time}`

const Time: React.FC = () => {
  const {
    seconds: timeSeconds,
    minutes: timeMinutes,
    hours: timeHours,
  } = useTime({ format: undefined })

  return (
    <div style={{ fontSize: '1.8rem' }}>
      <span>{formatTimeValue(timeHours)}</span>:
      <span>{formatTimeValue(timeMinutes)}</span>:
      <span>{formatTimeValue(timeSeconds)}</span>
    </div>
  )
}

export { Timer }
