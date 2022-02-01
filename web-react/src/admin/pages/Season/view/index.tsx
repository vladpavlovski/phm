import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrgSeasonRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId } from 'utils'
import dayjs from 'dayjs'

const GET_SEASONS = gql`
  query getSeasons($where: SeasonWhere) {
    seasons(where: $where) {
      seasonId
      name
      status
      startDate
      endDate
      nick
      org {
        name
      }
    }
  }
`

type TParams = {
  organizationSlug: string
}

const View: React.FC = () => {
  const { organizationSlug } = useParams<TParams>()
  const { error, loading, data } = useQuery(GET_SEASONS)

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'seasonId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgSeasonRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
        disableColumnMenu: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
        disableColumnMenu: true,
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        disableColumnMenu: true,
        width: 180,
        valueGetter: params => {
          return params.row.startDate
        },
        valueFormatter: params => {
          const stringifyDate = String(params.value)
          return dayjs(stringifyDate).format('LL')
        },
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        disableColumnMenu: true,
        width: 180,
        valueGetter: params => {
          return params.row.endDate
        },
        valueFormatter: params => {
          const stringifyDate = String(params.value)
          return dayjs(stringifyDate).format('LL')
        },
      },
      {
        field: 'org',
        headerName: 'Organization',
        disableColumnMenu: true,
        width: 250,
        valueGetter: params => {
          return params.row?.org?.name
        },
      },
    ],
    [organizationSlug]
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] => setIdFromEntityId(data?.seasons || [], 'seasonId'),

    [data]
  )

  const searchIndexes = React.useMemo(
    () => ['name', 'nick', 'status', 'org'],
    []
  )

  return (
    <XGridPage
      title="Seasons"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Seasons'}</Title>
      </div>
      <div>
        <LinkButton
          startIcon={<AddIcon />}
          to={getAdminOrgSeasonRoute(organizationSlug, 'new')}
        >
          Create
        </LinkButton>
      </div>
    </XGridPage>
  )
}

export { View as default }
