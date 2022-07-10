import React from 'react'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'

type Props = {
  title?: string
}

export const TitleDivider = ({ title }: Props) => {
  if (!title) return null
  return (
    <Divider variant="fullWidth" sx={{ marginY: 2 }}>
      <Typography variant="h5">{title.toUpperCase()}</Typography>
    </Divider>
  )
}
