import React, { useState } from 'react'
import { Controller, Control } from 'react-hook-form'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import { DEFAULT_CONVERTER, converters } from './transformers'
import PickerDialog from './PickerDialog'

type IRHFColorpicker = TextFieldProps & {
  control: Control
  name: string
  error: {
    message: string
  }
  convert: string
  defaultValue: string
}

const RHFColorpicker: React.FC<IRHFColorpicker> = props => {
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
              onChange={(c: {
                rgb: {
                  r: number
                  g: number
                  b: number
                  a?: number
                }
              }): void => {
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
  fullWidth: false,
  variant: 'outlined',
  convert: DEFAULT_CONVERTER,
}

export { RHFColorpicker }
