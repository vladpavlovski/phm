import React from 'react'
import { Controller, Control, ControllerRenderProps } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import DatePicker, { DatePickerProps } from '@mui/lab/DatePicker'
import dayjs from 'dayjs'

type TRHFDatepickerComponent = TextFieldProps &
  DatePickerProps & {
    control: Control
    name: string
    error: {
      message: string
    }
    defaultValue: string | number | Date | dayjs.Dayjs | null | undefined
  }

const RHFDatepickerComponent: React.FC<TRHFDatepickerComponent> = props => {
  const { control, name, defaultValue, variant, error, fullWidth, ...rest } =
    props
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

RHFDatepickerComponent.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'year',
  disableFuture: false,
  views: ['year', 'month', 'day'],
}

const RHFDatepicker = React.memo(RHFDatepickerComponent)

export { RHFDatepicker }
