import React from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@material-ui/core/TextField'

const RHFInput = props => {
  const { control, name, defaultValue, ...restProps } = props

  return (
    <Controller
      defaultValue={defaultValue || ''}
      control={control}
      name={name}
      render={props => (
        <TextField
          {...props}
          {...restProps}
          inputProps={{
            autoComplete: 'new-password',
          }}
        />
      )}
    />
  )
}

RHFInput.defaultProps = {
  defaultValue: null,
  multiple: false,
  fullWidth: false,
  variant: 'standard',
}

export { RHFInput }
