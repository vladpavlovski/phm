import React from 'react'
import { Controller, Control, ControllerRenderProps } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import dayjs from 'dayjs'
import TimePicker, { TimePickerProps } from '@mui/lab/TimePicker'
import { getDateFromTime } from '../../utils'

type TRHFTimepickerComponent = TextFieldProps &
  Omit<TimePickerProps, 'onChange' | 'value' | 'renderInput'> & {
    name: string
    control: Control
    error: {
      message: string
    }
  }

const RHFTimepicker: React.FC<TRHFTimepickerComponent> = React.memo(props => {
  const { control, name, defaultValue, variant, error, fullWidth, ...rest } =
    props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, value, ref }: ControllerRenderProps) => (
        <TimePicker
          {...rest}
          renderInput={params => (
            <TextField
              {...params}
              fullWidth={fullWidth}
              variant={variant}
              error={!!error}
              helperText={!!error && error?.message}
            />
          )}
          inputRef={ref}
          onChange={onChange}
          value={value}
        />
      )}
      defaultValue={defaultValue ? dayjs(getDateFromTime(defaultValue)) : null}
    />
  )
})

RHFTimepicker.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'hours',
  views: ['hours', 'minutes', 'seconds'],
  ampm: false,
  ampmInClock: false,
}

export { RHFTimepicker }
