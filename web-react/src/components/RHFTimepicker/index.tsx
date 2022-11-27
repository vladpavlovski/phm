import dayjs, { Dayjs } from 'dayjs'
import React from 'react'
import { Control, Controller, ControllerRenderProps } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { TimePicker, TimePickerProps } from '@mui/x-date-pickers/TimePicker'
import { getDateFromTime } from '../../utils'

type TRHFTimepickerComponent<TI, T> = TextFieldProps &
  Omit<TimePickerProps<TI, T>, 'onChange' | 'value' | 'renderInput'> & {
    name: string
    control: Control
    error: {
      message: string
    }
  }

const RHFTimepicker = (
  props: TRHFTimepickerComponent<
    string | number | Date | Dayjs | null | undefined,
    Dayjs
  >
) => {
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
}

RHFTimepicker.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'hours',
  views: ['hours', 'minutes', 'seconds'],
  ampm: false,
  ampmInClock: false,
}

export { RHFTimepicker }
