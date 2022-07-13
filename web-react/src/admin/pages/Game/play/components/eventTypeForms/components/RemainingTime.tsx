import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import { GameTimerContext } from 'admin/pages/Game/play/components/Timer'
import React from 'react'
import { IMaskInput } from 'react-imask'
import Grid from '@mui/material/Grid'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import { GameEventFormContext } from '../../../components/GameEventWizard'

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
        // @ts-expect-error check it later
        onAccept={(value: string) =>
          onChange({ target: { name: props.name, value } })
        }
        overwrite
      />
    )
  }
)

const RemainingTime = () => {
  const {
    state: { tempRemainingTime, tempGameTime },
  } = React.useContext(GameTimerContext)
  const { update } = React.useContext(GameEventFormContext)

  const [remainingTime, setRemainingTime] = React.useState(tempRemainingTime)
  const [gameTime, setGameTime] = React.useState(tempGameTime)
  return (
    <>
      <TitleDivider title={'Time'} />
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <InputLabel htmlFor="Remaining time">Remaining time</InputLabel>
          <Input
            fullWidth
            placeholder="Remaining time"
            value={remainingTime}
            onChange={e => {
              setRemainingTime(e.target.value)
            }}
            onBlur={() => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  remainingTime: remainingTime,
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
        </Grid>

        <Grid item xs={6}>
          <InputLabel htmlFor="Game time">Game time</InputLabel>
          <Input
            fullWidth
            placeholder="Game time"
            value={gameTime}
            onChange={e => {
              setGameTime(e.target.value)
            }}
            onBlur={() => {
              update(state => ({
                ...state,
                gameEventData: {
                  ...state.gameEventData,
                  gameTime: gameTime,
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
        </Grid>
      </Grid>
    </>
  )
}

export { RemainingTime }
