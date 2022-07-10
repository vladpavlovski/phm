import { TitleDivider } from 'admin/pages/Game/play/components/eventTypeForms/components'
import React from 'react'
import { IMaskInput } from 'react-imask'
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
    state: { gameEventData },
    update,
  } = React.useContext(GameEventFormContext)
  const [value, setValue] = React.useState(gameEventData?.remainingTime)

  return (
    <>
      <TitleDivider title={'Remaining time'} />
      <InputLabel htmlFor="formatted-text-mask-input">
        Remaining time
      </InputLabel>
      <Input
        fullWidth
        placeholder="Remaining time"
        value={value}
        onChange={e => {
          setValue(e.target.value)
        }}
        onBlur={() => {
          update(state => ({
            ...state,
            gameEventData: {
              ...state.gameEventData,
              remainingTime: value,
            },
          }))
        }}
        onFocus={event => {
          const target = event.target
          setTimeout(() => target.select(), 0)
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

export { RemainingTime }
