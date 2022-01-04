import React, { useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgEventRoute } from 'router/routes'
import { LinkButton, Title, Error, Loader } from 'components'

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

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TParams>()
  const { error, loading, data } = useQuery(GET_EVENTS, {
    variables: {
      where: { org: { urlSlug: organizationSlug } },
    },
    notifyOnNetworkStatusChange: true,
  })

  const columns = useMemo<GridColumns>(
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

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
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
            </Toolbar>
          </Paper>
          {loading && <Loader />}
          <Error message={error?.message} />
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.events, 'eventId')}
                loading={loading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          )}
        </Grid>
      </Grid>
    </Container>
  )
}

export { XGridTable as default }
