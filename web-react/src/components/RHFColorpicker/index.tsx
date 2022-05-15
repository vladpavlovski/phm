import React, { useState } from 'react'
import { Control, Controller } from 'react-hook-form'
import InputAdornment from '@mui/material/InputAdornment'
import TextField, { TextFieldProps } from '@mui/material/TextField'
import PickerDialog from './PickerDialog'
import { converters, DEFAULT_CONVERTER } from './transformers'

type IRHFColorpicker = TextFieldProps & {
  control: Control
  name: string
  error: {
    message: string
  }
  defaultValue: string
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
}

const RHFColorpicker: React.FC<IRHFColorpicker> = props => {
  const {
    control,
    name,
    error,
    defaultValue,
    iconStart,
    iconEnd,
    ...restProps
  } = props

  const [showPicker, setShowPicker] = useState(false)
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  return (
    <>
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
                startAdornment: iconStart ? (
                  <InputAdornment position="start">
                    {React.isValidElement(iconStart) &&
                      React.cloneElement(iconStart, {
                        style: { color: internalValue },
                      })}
                  </InputAdornment>
                ) : null,
                endAdornment: iconEnd ? (
                  <InputAdornment position="end">
                    {React.isValidElement(iconEnd) &&
                      React.cloneElement(iconEnd, {
                        style: { color: internalValue },
                      })}
                  </InputAdornment>
                ) : null,
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
                  const newValue = converters[DEFAULT_CONVERTER](c)
                  setInternalValue(newValue)
                  onChange(newValue)
                }}
              />
            )}
          </>
        )}
      />
    </>
  )
}

RHFColorpicker.defaultProps = {
  defaultValue: '',
  fullWidth: false,
  variant: 'outlined',
}

export { RHFColorpicker }
