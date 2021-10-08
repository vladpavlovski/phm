import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import DatePicker from '@mui/lab/DatePicker'
import dayjs from 'dayjs'

const RHFDatepicker = props => {
  const { control, name, defaultValue, variant, error, fullWidth, ...rest } =
    props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value, name, ref }) => (
        <DatePicker
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
          onBlur={onBlur}
          value={value}
          name={name}
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
  error: false,
}

export { RHFDatepicker }
