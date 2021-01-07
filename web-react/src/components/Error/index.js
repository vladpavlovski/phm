import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab'
import PropTypes from 'prop-types'

const Error = props => {
  const { message } = props
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      <pre>{message}</pre>
    </Alert>
  )
}

Error.propTypes = {
  message: PropTypes.string,
}

export { Error }
