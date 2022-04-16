import React from 'react'
import Typography from '@mui/material/Typography'

type TTitle = {
  children: string
}

const Title: React.FC<TTitle> = props => {
  return (
    <Typography component="h2" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  )
}

export { Title }
