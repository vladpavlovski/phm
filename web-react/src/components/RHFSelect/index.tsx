import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  SelectProps,
  MenuItem,
} from '@mui/material'
import { Controller, Control } from 'react-hook-form'

type TRHFSelectComponent = SelectProps & {
  control: Control
  name: string
  error: {
    message: string
  }
}

const RHFSelectComponent: React.FC<TRHFSelectComponent> = props => {
  const { name, label, control, defaultValue, children, variant } = props
  const labelId = React.useMemo(() => `${name}-label`, [])
  return (
    <FormControl fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        render={({ onChange, onBlur, value, name, ref }) => (
          <Select
            variant={variant}
            label={label}
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            name={name}
            labelId={labelId}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {children}
          </Select>
        )}
        name={name}
        control={control}
        defaultValue={defaultValue}
      />
    </FormControl>
  )
}

RHFSelectComponent.defaultProps = {
  variant: 'standard',
}

const RHFSelect = React.memo(RHFSelectComponent)

export { RHFSelect }
