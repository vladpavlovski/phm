import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import React from 'react'
import { IMaskInput } from 'react-imask'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import { GameEventFormContext } from '../../GameEventWizard'

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
        onBlur={() => {}}
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
