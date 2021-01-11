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
  } = props
  return (
    <Controller
      name={name}
      control={control}
      render={({ onChange, onBlur, value, name, ref }) => (
        <DatePicker
          renderInput={params => (
            <TextField {...params} margin="normal" variant={variant} />
          )}
          inputRef={ref}
          onChange={onChange}
          onBlur={onBlur}
          value={value}
          name={name}
          id={id}
          disableFuture
          openTo="year"
          // inputFormat="YYYY-MM-DD"
          label={label}
          views={['year', 'month', 'date']}
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
}

export { RHFDatepicker }
