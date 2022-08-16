import React from 'react'
import { Control, Controller, ControllerRenderProps } from 'react-hook-form'
import Autocomplete from '@mui/material/Autocomplete'
import TextField, { TextFieldProps } from '@mui/material/TextField'

type TRHFAutocomplete = {
  control: Control
  name: string
  multiple?: boolean
  autoHighlight?: boolean
  options: string[]
  label: string
  defaultValue: string | null
  fullWidth: boolean
  filterSelectedOptions?: boolean
}

const RHFAutocomplete: React.FC<TRHFAutocomplete> = props => {
  const { control, name, label, defaultValue, ...restProps } = props
  return (
    <Controller
      render={(props: ControllerRenderProps) => {
        return (
          <Autocomplete
            {...props}
            {...restProps}
            value={props.value || defaultValue}
            onChange={(_, data) => props.onChange(data)}
            renderInput={(params: TextFieldProps) => (
              <TextField
                {...params}
                label={label}
                variant="standard"
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password', // disable autocomplete and autofill
                }}
              />
            )}
          />
        )
      }}
      name={name}
      control={control}
      defaultValue={defaultValue}
    />
  )
}

RHFAutocomplete.defaultProps = {
  defaultValue: null,
  multiple: false,
  fullWidth: false,
  autoHighlight: true,
  filterSelectedOptions: true,
  options: [],
}

export { RHFAutocomplete, Autocomplete }
