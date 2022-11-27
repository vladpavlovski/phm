import dayjs, { Dayjs } from 'dayjs'
import React from 'react'
import { Control, Controller, ControllerRenderProps } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers'

type TRHFDatepickerComponent<TI, T> = TextFieldProps &
  Omit<DatePickerProps<TI, T>, 'renderInput' | 'onChange' | 'value'> & {
    control: Control
    name: string
    error?: {
      message: string
    }
    defaultValue?: string | number | Date | Dayjs | null | undefined
    onUpdate?(value: Dayjs): void
  }

const RHFDatepicker = (
  props: TRHFDatepickerComponent<
    string | number | Date | Dayjs | null | undefined,
    Dayjs
  >
) => {
  const {
    control,
    name,
    defaultValue,
    variant,
    error,
    fullWidth,
    required,
    onUpdate,
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
          onChange={(date, keyboardInputValue) => {
            onChange(date, keyboardInputValue)
            if (onUpdate && date) {
              onUpdate(date)
            }
          }}
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
