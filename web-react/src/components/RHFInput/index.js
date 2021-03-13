import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@material-ui/core/TextField'

const RHFInput = props => {
  const { control, name, defaultValue, error, ...restProps } = props
  return (
    <Controller
      defaultValue={defaultValue || ''}
      control={control}
      name={name}
      render={props => (
        <TextField
          {...props}
          {...restProps}
          error={!!error}
          helperText={!!error && error.message}
          inputProps={{
            autoComplete: 'off',
          }}
        />
      )}
    />
  )
}

RHFInput.defaultProps = {
  defaultValue: '',
  multiple: false,
  fullWidth: false,
  variant: 'standard',
  error: false,
}

export { RHFInput }
