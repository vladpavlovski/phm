import dayjs from 'dayjs'
import React from 'react'
import { Prompt } from 'react-router-dom'
import { useTime, useTimer } from 'react-timer-hook'
import { createCtx } from 'utils'
import { Game, RulePack } from 'utils/types'
import { MutationFunction } from '@apollo/client'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import Typography from '@mui/material/Typography'

type Props = {
  timeInMinutes: number
  gameData: Game
  updateGameResult: MutationFunction
  gameSettings: RulePack
}

type TimerContextProps = {
  minutes: number
  seconds: number
  tempGameTime: string
  tempRemainingTime: string
}
const [GameTimerContext, GameTimerProvider] = createCtx<TimerContextProps>({
  minutes: 0,
  seconds: 0,
  tempGameTime: '00:00',
  tempRemainingTime: '00:00',
})

const Timer = (props: Props) => {
  const { timeInMinutes, gameData, updateGameResult, gameSettings } = props
  const timerStarted = React.useRef(false)

  const { seconds, minutes, isRunning, start, pause, resume, restart } =
    useTimer({
      autoStart: false,
      expiryTimestamp: dayjs().add(timeInMinutes, 'minute').toDate(),
    })

  useTimerUpdate({
    minutes,
    seconds,
    gameSettings,
    periodActive: gameData?.gameResult?.periodActive,
  })

  React.useEffect(() => {
    timerStarted.current = false
    restart(dayjs().add(timeInMinutes, 'minute').toDate(), false)
  }, [gameData?.gameResult?.periodActive])

  const handleTimerClick = () => {
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

      timerStarted.current ? resume() : start()
      timerStarted.current = true
    }
  }

  const handleResetTimer = () => {
    timerStarted.current = false
    const time = dayjs().add(timeInMinutes, 'minute').toDate()
    restart(time, false)
    // updateGameResult({
    //   variables: {
    //     where: {
    //       gameResultId: gameData?.gameResult?.gameResultId,
    //     },
    //     update: {
    //       periodActive: null,
    //     },
    //   },
    // })
  }

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
}

const useTimerUpdate = ({
  minutes,
  seconds,
  gameSettings,
  periodActive,
}: {
  minutes: number
  seconds: number
  gameSettings: RulePack
  periodActive: string
}) => {
  const { update } = React.useContext(GameTimerContext)

  React.useEffect(() => {
    update({
      minutes,
      seconds,
      tempGameTime: getGameTime({
        minutes,
        seconds,
        gameSettings,
        periodActive,
      }),
      tempRemainingTime: `${formatTimeValue(minutes)}:${formatTimeValue(
        seconds
      )}`,
    })
  }, [minutes, seconds])
}

const getGameTime = ({
  minutes,
  seconds,
  gameSettings,
  periodActive,
}: {
  minutes: number
  seconds: number
  gameSettings: RulePack
  periodActive: string
}) => {
  const sortedPeriods = gameSettings.periods
    ?.slice()
    ?.sort((a, b) => (a.priority > b.priority ? 1 : -1))
  const activePeriod = sortedPeriods.find(p => p.name === periodActive)
  if (!activePeriod) return '00:00'
  const activePeriodIndex = sortedPeriods.findIndex(
    p => p.name === periodActive
  )
  const previousPeriod = sortedPeriods?.[activePeriodIndex - 1]
  const allPreviousPeriodsDuration = sortedPeriods
    .filter((_, i) => i < activePeriodIndex)
    .reduce((acc, p) => acc + p.duration, 0)

  const activePeriodDuration = activePeriod.duration
  const gameMinutes =
    activePeriodDuration +
    (seconds === 0 ? 1 : 0) -
    1 +
    (previousPeriod ? allPreviousPeriodsDuration : 0) -
    minutes
  const gameSeconds = seconds === 0 ? 0 : 60 - seconds

  return `${formatTimeValue(gameMinutes)}:${formatTimeValue(gameSeconds)}`
}

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

export { Timer, GameTimerProvider, GameTimerContext }
