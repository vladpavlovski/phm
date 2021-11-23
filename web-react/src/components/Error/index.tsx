import React from 'react'
import { Alert, AlertTitle } from '@mui/material'

interface IErrorComponent {
  message: string
}

const ErrorComponent: React.FC<IErrorComponent> = props => {
  const { message } = props
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      <pre>{message}</pre>
    </Alert>
  )
}

const Error = React.memo(ErrorComponent)

export { Error }
