import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@mui/material/TextField'

const RHFInputComponent = props => {
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

const RHFInput = React.memo(RHFInputComponent)

RHFInputComponent.defaultProps = {
  defaultValue: '',
  multiple: false,
  fullWidth: false,
  variant: 'standard',
  error: false,
}

export { RHFInput }
