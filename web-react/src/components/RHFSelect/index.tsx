import React from 'react'
import { Control, Controller } from 'react-hook-form'
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
} from '@mui/material'

type TRHFSelect = SelectProps & {
  control: Control
  name: string
  error: {
    message: string
  }
}

const RHFSelect: React.FC<TRHFSelect> = React.memo(props => {
  const {
    name,
    label,
    control,
    defaultValue,
    children,
    variant,
    required,
    error,
  } = props
  const labelId = React.useMemo(() => `${name}-label`, [])
  return (
    <FormControl variant={variant} fullWidth error={!!error}>
      <InputLabel required={required} id={labelId}>
        {label}
      </InputLabel>
      <Controller
        required={required}
        render={({ onChange, onBlur, value, name, ref }) => (
          <Select
            required={required}
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
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  )
})

RHFSelect.defaultProps = {
  variant: 'standard',
  required: false,
}

export { RHFSelect }
