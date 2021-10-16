import React from 'react'
import { FormControl, InputLabel, Select } from '@mui/material'
import { Controller } from 'react-hook-form'

const RHFSelectComponent = ({
  name,
  label,
  control,
  defaultValue,
  children,
  ...props
}) => {
  const labelId = React.useMemo(() => `${name}-label`, [])
  return (
    <FormControl {...props}>
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
