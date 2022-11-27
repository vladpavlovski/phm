import React from 'react'
import { Link as RouterLink, useParams } from 'react-router-dom'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { ParamsProps } from 'utils/types'
import { Avatar, Link, Stack, Typography } from '@mui/material'

type Props = {
  playerId: string
  name: string
  avatar: string
}

export const PlayerWithAvatar = ({ playerId, name, avatar }: Props) => {
  const { organizationSlug } = useParams<ParamsProps>()
  return (
    <Link
      underline="hover"
      component={RouterLink}
      to={getAdminOrgPlayerRoute(organizationSlug, playerId)}
      target="_blank"
    >
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
      >
        <Avatar alt={name} src={avatar} />
        <Typography variant="body2">{name}</Typography>
      </Stack>
    </Link>
  )
}
