import React from 'react'
import { Controller } from 'react-hook-form'
import PropTypes from 'prop-types'
import { FormControlLabel, Switch } from '@material-ui/core'

const RHFSwitch = ({ label, ...props }) => (
  <FormControlLabel
    control={<Controller as={Switch} {...props} />}
    label={label}
  />
)

RHFSwitch.propTypes = {
  control: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
}

export { RHFSwitch }
