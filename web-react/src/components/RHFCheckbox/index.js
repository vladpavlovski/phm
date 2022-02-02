import React from 'react'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import { FormControlLabel, FormHelperText, Switch } from '@mui/material'

const RHFSwitchComponent = ({ label, error, name, id, ...props }) => (
  <>
    <FormControlLabel
      control={<Controller as={Switch} {...props} />}
      label={label}
      id={id}
      name={name}
    />
    <FormHelperText error>{error ? error : ''}</FormHelperText>
  </>
)

RHFSwitchComponent.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

const RHFSwitch = React.memo(RHFSwitchComponent)

export { RHFSwitch }