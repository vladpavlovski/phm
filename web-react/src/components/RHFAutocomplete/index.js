import React, { useCallback } from 'react'
import { Controller } from 'react-hook-form'
import { default as AutocompleteLib } from '@material-ui/lab/Autocomplete'
import { TextField } from '@material-ui/core'

const getOpObj = (option, propName, data) => {
  if (option && !option[propName])
    option = data.find(op => op[propName] === option)
  return option
}

const Autocomplete = props => {
  const {
    options,
    id,
    optionPropertyToCompare,
    optionPropertyToShow,
    defaultValue,
    value,
    label,
    variant,
    renderOption,
    multiple,
    fullWidth,
    renderTags,
    onChange,
  } = props

  return (
    <AutocompleteLib
      id={id}
      openOnFocus
      value={value}
      fullWidth={fullWidth}
      multiple={multiple}
      options={options}
      autoHighlight
      filterSelectedOptions
      onChange={onChange}
      getOptionLabel={option => {
        const optionObj = getOpObj(option, optionPropertyToCompare, options)
        return (optionObj && optionObj[optionPropertyToShow]) || ''
      }}
      getOptionSelected={(option, value) => {
        const optionObj = getOpObj(value, optionPropertyToCompare, options)
        return (
          (option &&
            optionObj &&
            option[optionPropertyToCompare] ===
              optionObj[optionPropertyToCompare]) ||
          ''
        )
      }}
      renderOption={renderOption}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          variant={variant}
          fullWidth={fullWidth}
          value={multiple ? defaultValue : null}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'disabled', // disable autocomplete and autofill
          }}
        />
      )}
      renderTags={renderTags}
    />
  )
}

const RHFAutocomplete = props => {
  const {
    options,
    control,
    name,
    optionPropertyToCompare,
    defaultValue,
    multiple,
  } = props

  const onChange = useCallback(
    ([, obj]) =>
      obj &&
      getOpObj(obj, optionPropertyToCompare, options) &&
      getOpObj(obj, optionPropertyToCompare, options)[optionPropertyToCompare],
    [optionPropertyToCompare, options]
  )

  const onChangeMultiple = useCallback(([, obj]) => obj.map(o => o), [])

  return (
    <Controller
      as={<Autocomplete {...props} />}
      onChange={!multiple ? onChange : onChangeMultiple}
      name={name}
      control={control}
      defaultValue={defaultValue || []}
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
