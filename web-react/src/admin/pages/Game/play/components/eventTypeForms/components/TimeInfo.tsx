import { useGamePlay } from 'admin/pages/Game/play'
import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import React from 'react'
import { IMaskInput } from 'react-imask'
import { formatTimeValue } from 'utils'
import { Game, RulePack } from 'utils/types'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import { GameEventFormContext } from '../../GameEventWizard'

const TIME_REGEX = /^([0-9][0-9]):[0-5][0-9]$/
const ZERO_TIME = '00:00'

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}

const TextMaskCustom = React.forwardRef<HTMLElement, CustomProps>(
  function TextMaskCustom(props, ref) {
    const { onChange, ...other } = props
    return (
      <IMaskInput
        {...other}
        mask="00:00"
        definitions={{
          '#': /^([0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
        }}
        // @ts-expect-error check it later
        inputRef={ref}
        onAccept={(value: string) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    )
  }
)

const convertToGameTime = ({
  gameData,
  gameSettings,
  time,
}: {
  gameData: Game
  gameSettings: RulePack
  time?: string
}) => {
  // check if time matched
  if (!time || time?.match(TIME_REGEX) === null) return ZERO_TIME

  const periodActive = gameData?.gameResult?.periodActive

  const sortedPeriods = gameSettings?.periods
    .slice()
    .sort((a, b) => (a.priority > b.priority ? 1 : -1))
  const activePeriod = sortedPeriods.find(p => p.name === periodActive)
  if (!activePeriod) return ZERO_TIME
  const activePeriodIndex = sortedPeriods.findIndex(
    p => p.name === periodActive
  )
  const previousPeriod = sortedPeriods?.[activePeriodIndex - 1]
  const allPreviousPeriodsDuration = sortedPeriods
    .filter((_, i) => i < activePeriodIndex)
    .reduce((acc, p) => acc + p.duration, 0)

  const [minutes, seconds] = time.split(':')

  const gameMinutes = previousPeriod
    ? allPreviousPeriodsDuration + (activePeriod.duration - Number(minutes))
    : activePeriod.duration - Number(minutes)
  const gameSeconds = Number(seconds) === 0 ? 0 : 60 - Number(seconds)
  return `${formatTimeValue(gameMinutes)}:${formatTimeValue(gameSeconds)}`
}

const convertToRemainingTime = ({
  gameData,
  gameSettings,
  time,
}: {
  gameData: Game
  gameSettings: RulePack
  time?: string
}) => {
  // check if time matched
  if (!time || time?.match(TIME_REGEX) === null) return ZERO_TIME

  const periodActive = gameData?.gameResult?.periodActive
  const sortedPeriods = gameSettings?.periods
    .slice()
    .sort((a, b) => (a.priority > b.priority ? 1 : -1))
  const activePeriod = sortedPeriods.find(p => p.name === periodActive)
  if (!activePeriod) return ZERO_TIME
  const activePeriodIndex = sortedPeriods.findIndex(
    p => p.name === periodActive
  )
  const previousPeriod = sortedPeriods?.[activePeriodIndex - 1]
  const allPreviousPeriodsDuration = sortedPeriods
    .filter((_, i) => i < activePeriodIndex)
    .reduce((acc, p) => acc + p.duration, 0)

  const [minutes, seconds] = time.split(':')

  const remainingMinutes = previousPeriod
    ? allPreviousPeriodsDuration +
      activePeriod.duration -
      Number(minutes) -
      (Number(seconds) === 0 ? 0 : 1)
    : activePeriod.duration - Number(minutes)

  const remainingSeconds = Number(seconds) === 0 ? 0 : 60 - Number(seconds)
  return `${formatTimeValue(remainingMinutes)}:${formatTimeValue(
    remainingSeconds
  )}`
}

const TimeInfo = () => {
  return (
    <>
      <TitleDivider title={'Time'} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <RemainingTime />
        </Grid>
        <Grid item xs={6}>
          <GameTime />
        </Grid>
      </Grid>
    </>
  )
}

const RemainingTime = () => {
  const {
    update,
    state: { gameEventData },
  } = React.useContext(GameEventFormContext)
  const { gameData, gameSettings } = useGamePlay()
  if (!gameData || !gameSettings) return null

  return (
    <>
      <InputLabel htmlFor="Remaining time">Remaining time</InputLabel>
      <Input
        fullWidth
        placeholder="Remaining time"
        value={gameEventData?.remainingTime}
        onChange={e => {
          update(state => ({
            ...state,
            gameEventData: {
              ...state.gameEventData,
              remainingTime: e.target.value,
            },
          }))
        }}
        onBlur={() => {
          update(state => ({
            ...state,
            gameEventData: {
              ...state.gameEventData,
              gameTime: convertToGameTime({
                gameData,
                gameSettings,
                time: state?.gameEventData?.remainingTime,
              }),
            },
          }))
        }}
        onFocus={event => {
          const target = event.target
          target.select()
        }}
        autoFocus
        name="Remaining time"
        // @ts-expect-error check it later
        inputComponent={TextMaskCustom}
        inputProps={{
          autoComplete: 'off',
        }}
      />
    </>
  )
}

const GameTime = () => {
  const {
    update,
    state: { gameEventData },
  } = React.useContext(GameEventFormContext)
  const { gameData, gameSettings } = useGamePlay()
  if (!gameData || !gameSettings) return null

  return (
    <>
      <InputLabel htmlFor="Game time">Game time</InputLabel>
      <Input
        fullWidth
        placeholder="Game time"
        value={gameEventData?.gameTime}
        onChange={e => {
          update(state => ({
            ...state,
            gameEventData: {
              ...state.gameEventData,
              gameTime: e.target.value,
            },
          }))
        }}
        onBlur={() => {
          update(state => ({
            ...state,
            gameEventData: {
              ...state.gameEventData,
              remainingTime: convertToRemainingTime({
                gameData,
                gameSettings,
                time: state?.gameEventData?.gameTime,
              }),
            },
          }))
        }}
        onFocus={event => {
          const target = event.target
          target.select()
        }}
        autoFocus
        name="Game time"
        // @ts-expect-error check it later
        inputComponent={TextMaskCustom}
        inputProps={{
          autoComplete: 'off',
        }}
      />
    </>
  )
}

export { TimeInfo }
