import React from 'react'
import { Alert, AlertTitle } from '@mui/material'

interface IErrorComponent {
  message: string | undefined
}

const Error: React.FC<IErrorComponent> = props => {
  const { message } = props
  return message ? (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      <pre>{message}</pre>
    </Alert>
  ) : null
}

export { Error }
