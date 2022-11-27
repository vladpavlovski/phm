import React from 'react'
import ManIcon from '@mui/icons-material/Man'
import TransgenderIcon from '@mui/icons-material/Transgender'
import WomanIcon from '@mui/icons-material/Woman'
import { Chip } from '@mui/material'

type Props = {
  type: string
}

const getIcon = (type: string) => {
  switch (type) {
    case 'male':
      return <ManIcon />
    case 'female':
      return <WomanIcon />
    case 'other':
      return <TransgenderIcon />
    default:
      return undefined
  }
}

export const Gender = ({ type }: Props) => {
  return (
    <Chip
      avatar={getIcon(type)}
      variant="outlined"
      label={type.charAt(0).toUpperCase()}
      size="small"
    />
  )
}
