import React from 'react'
import Typography from '@mui/material/Typography'

export default function Title(props: any) {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  )
}
