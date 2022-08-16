import React from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Container from '@mui/material/Container'

type Props = {
  message: string | undefined
}

const Warning = ({ message }: Props) => {
  return message ? (
    <Container>
      <Alert severity="warning">
        <AlertTitle>Warning</AlertTitle>
        <pre>{message}</pre>
      </Alert>
    </Container>
  ) : null
}

export { Warning }
