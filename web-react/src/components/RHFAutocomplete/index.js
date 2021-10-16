import React from 'react'
import { Controller } from 'react-hook-form'
import { TextField, Autocomplete } from '@mui/material'

const RHFAutocompleteComponent = props => {
  const { control, name, label, defaultValue, ...restProps } = props
  return (
    <Controller
      render={props => {
        return (
          <Autocomplete
            {...props}
            {...restProps}
            name={name}
            value={props.value || defaultValue}
            onChange={(_, data) => props.onChange(data)}
            renderInput={params => (
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
