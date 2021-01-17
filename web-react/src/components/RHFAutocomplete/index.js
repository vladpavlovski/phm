import React from 'react'
import { Controller } from 'react-hook-form'
import { TextField, Autocomplete } from '@material-ui/core'

const RHFAutocomplete = props => {
  const { control, name, label, ...restProps } = props

  return (
    <Controller
      render={props => (
        <Autocomplete
          {...props}
          {...restProps}
          name={name}
          onChange={(_, data) => props.onChange(data)}
          renderInput={params => (
            <TextField
              {...params}
              label={label}
              variant="standard"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                ...params.inputProps,
                autoComplete: 'new-password', // disable autocomplete and autofill
              }}
            />
          )}
        />
      )}
      name={name}
      control={control}
    />
  )
}

RHFAutocomplete.defaultProps = {
  defaultValue: null,
  multiple: false,
  fullWidth: false,
  autoHighlight: true,
  filterSelectedOptions: true,
}

export { RHFAutocomplete, Autocomplete }
