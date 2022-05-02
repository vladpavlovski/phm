import React from 'react'
import { Control, Controller } from 'react-hook-form'
import { FormControl, InputLabel, MenuItem, Select, SelectProps } from '@mui/material'

type TRHFSelect = SelectProps & {
  control: Control
  name: string
  error: {
    message: string
  }
}

const RHFSelect: React.FC<TRHFSelect> = React.memo(props => {
  const { name, label, control, defaultValue, children, variant } = props
  const labelId = React.useMemo(() => `${name}-label`, [])
  return (
    <FormControl variant={variant} fullWidth>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        render={({ onChange, onBlur, value, name, ref }) => (
          <Select
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
})

RHFSelect.defaultProps = {
  variant: 'standard',
}

export { RHFSelect }
