import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'
import dayjs from 'dayjs'
import TimePicker from '@mui/lab/TimePicker'
import { getDateFromTime } from '../../utils'

const RHFTimepicker = props => {
  const { control, name, defaultValue, variant, error, fullWidth, ...rest } =
    props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value, name, ref }) => (
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
          onBlur={onBlur}
          value={value}
          name={name}
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
  disableFuture: false,
  views: ['hours', 'minutes', 'seconds'],
  error: false,
  ampm: false,
  ampmInClock: false,
}

export { RHFTimepicker }
