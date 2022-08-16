import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'

type Props = {
  message: string | undefined
}

const Warning = ({ message }: Props) => {
  return message ? (
    <Alert severity="error">
      <AlertTitle>Warning</AlertTitle>
      <pre>{message}</pre>
    </Alert>
  ) : null
}

export { Warning }
