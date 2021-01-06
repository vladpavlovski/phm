import React from 'react'
import { Controller } from 'react-hook-form'

import dayjs from 'dayjs'
import { KeyboardDatePicker } from '@material-ui/pickers'

const RHFDatepicker = props => {
  const {
    control,
    id,
    name,
    defaultValue,
    label,
    variant,
    inputVariant,
    error,
    helperText,
    fullWidth,
    inputProps,
  } = props
  return (
    <Controller
      as={
        <KeyboardDatePicker
          id={id}
          disableFuture
          autoOk
          variant={variant}
          inputVariant={inputVariant}
          openTo="year"
          format="DD/MM/YYYY"
          label={label}
          views={['year', 'month', 'date']}
        />
      }
      fullWidth={fullWidth}
      inputProps={inputProps}
      name={name}
      control={control}
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
