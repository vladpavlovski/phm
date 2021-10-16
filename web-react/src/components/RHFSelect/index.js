import React, { useMemo } from 'react'
import { FormControl, InputLabel, Select, Input } from '@mui/material'
import { Controller } from 'react-hook-form'

const ITEM_HEIGHT = 48
const ITEM_PADDING_TOP = 8
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
}
const RHFSelect = ({
  name,
  label,
  control,
  defaultValue,
  children,
  ...props
}) => {
  const labelId = useMemo(() => `${name}-label`, [])
  return (
    <FormControl {...props}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Controller
        render={({ onChange, onBlur, value, name, ref }) => (
          <Select
            ref={ref}
            onChange={onChange}
            onBlur={onBlur}
            value={value}
            name={name}
            labelId={labelId}
            label={label}
            input={<Input />}
            MenuProps={MenuProps}
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
export { RHFSelect }
