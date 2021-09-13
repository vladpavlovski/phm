import React from 'react'
import PropTypes from 'prop-types'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import { IMaskInput } from 'react-imask'

const TextMaskCustom = React.forwardRef(function TextMaskCustom(props, ref) {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask="00:00"
      definitions={{
        '#': /^([0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/,
      }}
      inputRef={ref}
      onAccept={value => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  )
})

TextMaskCustom.propTypes = {
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

const RemainingTime = props => {
  const { gameEventData, setGameEventData, activeStepData } = props
  return (
    <>
      {/* <FormControl variant="standard"> */}
      <InputLabel htmlFor="formatted-text-mask-input">
        Remaining time
      </InputLabel>
      <Input
        fullWidth
        placeholder="Remaining time"
        value={gameEventData?.remainingTime}
        onChange={e => {
          setGameEventData(state => ({
            ...state,
            remainingTime: e.target.value,
          }))
        }}
        onFocus={event => {
          const target = event.target
          setTimeout(() => target.select(), 0)
        }}
        autoFocus
        name="Remaining time"
        inputComponent={TextMaskCustom}
        required={!activeStepData.optional}
        // error={!gameEventData?.remainingTime}
        // helperText={
        //   !gameEventData?.remainingTime &&
        //   'Remaining time should be defined'
        // }
        inputProps={{
          autoComplete: 'off',
        }}
      />
      {/* </FormControl> */}
    </>
  )
}

RemainingTime.propTypes = {
  gameEventData: PropTypes.object,
  setGameEventData: PropTypes.func,
  activeStepData: PropTypes.object,
}

export { RemainingTime }
