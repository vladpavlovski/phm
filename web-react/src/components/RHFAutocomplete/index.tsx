import React from 'react'
import { Controller, Control, ControllerRenderProps } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'

interface TRHFAutocompleteComponent {
  control: Control
  name: string
  multiple: boolean
  autoHighlight: boolean
  options: []
  label: string
  defaultValue: string | null
  fullWidth: boolean
  filterSelectedOptions: boolean
}

const RHFAutocompleteComponent: React.FC<TRHFAutocompleteComponent> = props => {
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

RHFAutocompleteComponent.defaultProps = {
  defaultValue: null,
  multiple: false,
  fullWidth: false,
  autoHighlight: true,
  filterSelectedOptions: true,
  options: [],
}

const RHFAutocomplete = React.memo(RHFAutocompleteComponent)

export { RHFAutocomplete, Autocomplete }
