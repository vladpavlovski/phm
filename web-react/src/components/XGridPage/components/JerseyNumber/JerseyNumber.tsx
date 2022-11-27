import React from 'react'
import { Jersey } from 'utils/types'
import NumbersIcon from '@mui/icons-material/Numbers'
import { Stack } from '@mui/material'
import Chip from '@mui/material/Chip'

type Props = {
  jerseys: Jersey[]
}

export const JerseyNumber = ({ jerseys }: Props) => {
  return (
    <Stack direction="row" gap={1}>
      {jerseys.map(jersey => (
        <Chip
          avatar={<NumbersIcon />}
          variant="outlined"
          key={jersey.jerseyId}
          label={jersey.number}
          size="small"
        />
      ))}
    </Stack>
  )
}
