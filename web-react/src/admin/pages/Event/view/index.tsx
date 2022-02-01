import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { getAdminOrgEventRoute } from 'router/routes'
import { Title, LinkButton, XGridPage } from 'components'
import { setIdFromEntityId, formatDate, formatTime } from 'utils'

const GET_EVENTS = gql`
  query getEvents($where: EventWhere) {
    events(where: $where) {
      eventId
      name
      description
      date
      time
    }
  }
`

type TParams = {
  organizationSlug: string
}

const View: React.FC = () => {
  const { organizationSlug } = useParams<TParams>()
  const { error, loading, data } = useQuery(GET_EVENTS, {
    variables: {
      where: { org: { urlSlug: organizationSlug } },
    },
    notifyOnNetworkStatusChange: true,
  })

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'eventId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgEventRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },
      {
        field: 'description',
        headerName: 'Description',
        width: 300,
      },
      {
        field: 'date',
        headerName: 'Date',
        width: 180,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.date,
        valueFormatter: params =>
          formatDate(typeof params?.value === 'string' ? params?.value : ''),
      },
      {
        field: 'time',
        headerName: 'Time',
        width: 100,
        disableColumnMenu: true,
        valueGetter: params => params?.row?.time,
        valueFormatter: params =>
          formatTime(typeof params?.value === 'string' ? params?.value : ''),
      },
    ],
    [organizationSlug]
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] => setIdFromEntityId(data?.events || [], 'eventId'),

    [data]
  )

  const searchIndexes = React.useMemo(
    () => ['name', 'description', 'date', 'time'],
    []
  )

  return (
    <XGridPage
      title="Events"
      loading={loading}
      error={error}
      columns={columns}
      rows={queryData}
      searchIndexes={searchIndexes}
    >
      <div>
        <Title>{'Events'}</Title>
      </div>
      <div>
        <LinkButton
          startIcon={<AddIcon />}
          to={getAdminOrgEventRoute(organizationSlug, 'new')}
        >
          Create
        </LinkButton>
      </div>
    </XGridPage>
  )
}

export { View as default }
