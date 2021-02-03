import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@material-ui/core/TextField'
import dayjs from 'dayjs'
import DatePicker from '@material-ui/lab/DatePicker'

const RHFDatepicker = props => {
  const {
    control,
    id,
    name,
    defaultValue,
    label,
    variant,
    error,
    helperText,
    fullWidth,
    openTo,
    disableFuture,
    views,
    inputFormat,
  } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value, name, ref }) => (
        <DatePicker
          renderInput={params => (
            <TextField
              {...params}
              // margin="normal"
              fullWidth={fullWidth}
              variant={variant}
            />
          )}
          inputRef={ref}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          name={name}
          id={id}
          disableFuture={disableFuture}
          openTo={openTo}
          inputFormat={inputFormat}
          label={label}
          views={views}
        />
      )}
      defaultValue={defaultValue ? dayjs(defaultValue) : null}
      error={error}
      helperText={helperText}
    />
  )
}

RHFDatepicker.defaultProps = {
  defaultValue: null,
  fullWidth: false,
  openTo: 'year',
  disableFuture: false,
  views: ['year', 'month', 'date'],
}

export { RHFDatepicker }
