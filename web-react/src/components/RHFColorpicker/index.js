import React, { useState } from 'react'
import { Controller } from 'react-hook-form'
import TextField from '@material-ui/core/TextField'
import { DEFAULT_CONVERTER, converters } from './transformers'
import PickerDialog from './PickerDialog'

const RHFColorpicker = props => {
  const { control, name, error, convert, defaultValue, ...restProps } = props

  const [showPicker, setShowPicker] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  return (
    <Controller
      defaultValue={defaultValue || ''}
      control={control}
      name={name}
      render={({ onChange, ...renderProps }) => (
        <>
          <TextField
            {...restProps}
            {...renderProps}
            onClick={() => setShowPicker(true)}
            onChange={e => {
              setInternalValue(e.target.value)
              onChange(e.target.value)
            }}
            error={!!error}
            helperText={!!error && error.message}
            InputProps={{
              style: {
                color: internalValue,
              },
            }}
          />
          {showPicker && (
            <PickerDialog
              value={internalValue}
              onClick={() => {
                setShowPicker(false)
                onChange(internalValue)
              }}
              onChange={c => {
                const newValue = converters[convert](c)
                setInternalValue(newValue)
                onChange(newValue)
              }}
            />
          )}
        </>
      )}
    />
  )
}

RHFColorpicker.defaultProps = {
  defaultValue: '',
  multiple: false,
  fullWidth: false,
  variant: 'standard',
  error: false,
  convert: DEFAULT_CONVERTER,
}

export { RHFColorpicker }
