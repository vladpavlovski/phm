import { LinkButton, XGridPage } from 'components'
import dayjs from 'dayjs'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgSeasonRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { gql, useLazyQuery, useQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'

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
  const { error, loading, data } = useQuery(GET_SEASONS, {
    variables: {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
      },
    },
  })

  const [getUnassigned, { data: data2 }] = useLazyQuery(GET_SEASONS, {
    variables: {
      where: {
        org: null,
      },
    },
  })

  const [view, setView] = React.useState('assigned')

  const columns: GridColumns = [
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
  ]

  const queryData: GridRowsProp[] = setIdFromEntityId(
    view === 'assigned' ? data?.seasons || [] : data2?.seasons || [],
    'seasonId'
  )

  const searchIndexes = ['name', 'nick', 'status', 'org']

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
        <ButtonGroup variant="outlined" size="small">
          <Button
            variant={view === 'assigned' ? 'contained' : 'outlined'}
            onClick={() => {
              setView('assigned')
            }}
          >
            Assigned
          </Button>
          <Button
            variant={view === 'unassigned' ? 'contained' : 'outlined'}
            onClick={() => {
              setView('unassigned')
              if (!data2) getUnassigned()
            }}
          >
            Unassigned
          </Button>
        </ButtonGroup>
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
