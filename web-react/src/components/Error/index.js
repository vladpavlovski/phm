import React from 'react'
import { Alert, AlertTitle } from '@mui/material'
import PropTypes from 'prop-types'

const ErrorComponent = props => {
  const { message } = props
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      <pre>{message}</pre>
    </Alert>
  )
}

ErrorComponent.propTypes = {
  message: PropTypes.string,
}

const Error = React.memo(ErrorComponent)

export { Error }
