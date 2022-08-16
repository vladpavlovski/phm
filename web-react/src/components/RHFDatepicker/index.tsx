import dayjs from 'dayjs'
import React from 'react'
import { Control, Controller, ControllerRenderProps } from 'react-hook-form'
import DatePicker, { DatePickerProps } from '@mui/lab/DatePicker'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type TRHFDatepickerComponent = TextFieldProps &
  Omit<DatePickerProps, 'renderInput' | 'onChange' | 'value'> & {
    control: Control
    name: string
    error?: {
      message: string
    }
    defaultValue?: string | number | Date | dayjs.Dayjs | null | undefined
  }

const RHFDatepicker = (props: TRHFDatepickerComponent) => {
  const {
    control,
    name,
    defaultValue,
    variant,
    error,
    fullWidth,
    required,
    ...rest
  } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value, ref }: ControllerRenderProps) => (
        <DatePicker
          {...rest}
          renderInput={params => (
            <TextField
              {...params}
              required={required}
              onBlur={onBlur}
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
      defaultValue={dayjs(defaultValue).isValid() ? defaultValue : null}
    />
  )
}

RHFDatepicker.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'year',
  disableFuture: false,
  views: ['year', 'month', 'day'],
  required: false,
}

export { RHFDatepicker }
