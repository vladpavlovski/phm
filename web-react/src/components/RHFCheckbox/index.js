import React from 'react'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import { FormControlLabel, FormHelperText, Checkbox } from '@material-ui/core'

const RHFCheckbox = ({ label, error, name, id, ...props }) => (
  <>
    <FormControlLabel
      control={<Controller as={Checkbox} {...props} />}
      label={label}
      id={id}
      name={name}
    />
    <FormHelperText error>{error ? error : ''}</FormHelperText>
  </>
)

RHFCheckbox.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

export { RHFCheckbox }
