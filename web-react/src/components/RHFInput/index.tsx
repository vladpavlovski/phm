import React from 'react'
import { Controller, Control, FieldError } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type TRHFInput = TextFieldProps & {
  control: Control
  name: string
  error?: FieldError
}

const RHFInput: React.FC<TRHFInput> = React.memo(props => {
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
          helperText={error?.message}
          inputProps={{
            autoComplete: 'off',
          }}
        />
      )}
    />
  )
})

RHFInput.defaultProps = {
  defaultValue: '',
  multiline: false,
  fullWidth: false,
  variant: 'outlined',
}

export { RHFInput }
