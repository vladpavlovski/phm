import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@material-ui/core/TextField'
import DatePicker from '@material-ui/lab/DatePicker'
import { getDateFromDate } from '../../utils'

const RHFDatepicker = props => {
  const {
    control,
    name,
    defaultValue,
    variant,
    error,
    fullWidth,
    ...rest
  } = props
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
      defaultValue={defaultValue ? getDateFromDate(defaultValue) : null}
    />
  )
}

RHFDatepicker.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'year',
  disableFuture: false,
  views: ['year', 'month', 'date'],
  error: false,
}

export { RHFDatepicker }
