import { PlayerLevel } from 'admin/pages/Player/components/PlayerLevel'
import { XGridPage } from 'components'
import { Gender } from 'components/XGridPage/components/Gender'
import { JerseyNumber } from 'components/XGridPage/components/JerseyNumber'
import { PlayerWithAvatar } from 'components/XGridPage/components/PlayerWithAvatar'
import { TeamWithLogo } from 'components/XGridPage/components/TeamWithLogo'
import React from 'react'
import { useParams } from 'react-router-dom'
import { formatDate, getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { ParamsProps } from 'utils/types'
import { gql, useQuery } from '@apollo/client'
import { Link } from '@mui/material'
// import { Avatar, Link, Stack, Typography } from '@mui/material'
import { GridColumns, GridPinnedColumns } from '@mui/x-data-grid-pro'

export const GET_PLAYERS = gql`
  query getPlayers($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      name
      levelCode
      birthday
      userName
      phone
      email
      gender
      stick
      height
      weight
      externalId
      activityStatus
      countryBirth
      cityBirth
      country
      city
      avatar
      publicProfileUrl
      positions {
        positionId
        name
      }
      teams {
        teamId
        name
        logo
      }
      jerseys {
        jerseyId
        number
        name
      }
    }
  }
`

const columns: GridColumns = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    renderCell: params => {
      return (
        <PlayerWithAvatar
          playerId={params.row.playerId}
          name={params.row.name}
          avatar={params.row.avatar}
        />
      )
    },
  },

  {
    field: 'levelCode',
    headerName: 'Level',
    width: 150,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      return <PlayerLevel code={params.value} />
    },
  },
  {
    field: 'teams',
    headerName: 'Teams',
    width: 200,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      return <TeamWithLogo teams={params.row?.teams} />
    },
    valueGetter: params => {
      return getXGridValueFromArray(params.row.teams, 'name')
    },
  },
  {
    field: 'positions',
    headerName: 'Positions',
    width: 200,
    disableColumnMenu: true,
    sortable: false,
    valueGetter: params => {
      return getXGridValueFromArray(params.row.positions, 'name')
    },
  },
  {
    field: 'jerseys',
    headerName: 'Jerseys',
    width: 200,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      return <JerseyNumber jerseys={params.row.jerseys} />
    },
    valueGetter: params => {
      return getXGridValueFromArray(params.row.jerseys, 'name')
    },
  },
  {
    field: 'birthday',
    headerName: 'Birthday',
    width: 100,
    disableColumnMenu: true,
    sortable: false,
    valueFormatter: params => formatDate(params?.value, 'DD.MM.YYYY'),
  },
  {
    field: 'phone',
    headerName: 'Phone',
    width: 100,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 150,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'gender',
    headerName: 'Gender',
    width: 80,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      return <Gender type={params.value} />
    },
  },
  {
    field: 'stick',
    headerName: 'Stick',
    width: 80,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'weight',
    headerName: 'Weight',
    width: 50,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'height',
    headerName: 'Height',
    width: 50,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'externalId',
    headerName: 'External Id',
    width: 80,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'activityStatus',
    headerName: 'Status',
    width: 80,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'countryBirth',
    headerName: 'Country Birth',
    width: 130,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'cityBirth',
    headerName: 'City Birth',
    width: 100,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'country',
    headerName: 'Country',
    width: 130,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'city',
    headerName: 'City',
    width: 100,
    disableColumnMenu: true,
    sortable: false,
  },
  {
    field: 'publicProfileUrl',
    headerName: 'Profile',
    width: 100,
    disableColumnMenu: true,
    sortable: false,
    renderCell: params => {
      return (
        <Link href={params.value} target="_blank" underline="hover">
          {params.value}
        </Link>
      )
    },
    valueGetter: params => {
      return params.value
    },
  },
  {
    field: 'avatar',
    headerName: 'Avatar URL',
    width: 200,
    renderCell: params => {
      return (
        <Link href={params.value} target="_blank" underline="hover">
          {params.value}
        </Link>
      )
    },
    valueGetter: params => {
      return params.value
    },
  },
]

const searchIndexes = ['name', 'levelCode']
const pinnedColumns: GridPinnedColumns = {
  left: ['name'],
}

const View = () => {
  const { organizationSlug } = useParams<ParamsProps>()
  const { error, loading, data } = useQuery(GET_PLAYERS, {
    variables: {
      where: {
        teams: {
          orgs: {
            urlSlug: organizationSlug,
          },
        },
      },
    },
  })

  return (
    <XGridPage
      title="Players"
      pinnedColumns={pinnedColumns}
      loading={loading}
      error={error}
      columns={columns}
      rows={setIdFromEntityId(data?.players || [], 'playerId')}
      searchIndexes={searchIndexes}
    />
  )
}

export { View as default }
