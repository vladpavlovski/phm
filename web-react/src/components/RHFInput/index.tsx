import React from 'react'
import { Controller, Control } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type TRHFInputComponent = TextFieldProps & {
  control: Control
  name: string
  error: {
    message: string
  }
}

const RHFInputComponent: React.FC<TRHFInputComponent> = props => {
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
          helperText={!!error?.message}
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
  multiline: false,
  fullWidth: false,
  variant: 'outlined',
}

export { RHFInput }
