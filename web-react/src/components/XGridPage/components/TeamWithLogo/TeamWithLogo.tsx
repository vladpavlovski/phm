import React from 'react'
import { Team } from 'utils/types'
import { Avatar, Chip, Stack } from '@mui/material'

export const TeamWithLogo = ({ teams }: { teams: Team[] }) => {
  return (
    <Stack spacing={1} direction="row">
      {teams?.map((team: Team) => (
        <Chip
          size="medium"
          key={team?.teamId}
          avatar={<Avatar alt={team?.name} src={team?.logo} />}
          label={team?.name}
          color="info"
        />
      ))}
    </Stack>
  )
}
