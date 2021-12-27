import React from 'react'
import { gql, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgSeasonRoute } from 'router/routes'
import { LinkButton, Title, Error, Loader } from 'components'
import { setIdFromEntityId } from 'utils'

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

type TXGridTableParams = {
  organizationSlug: string
}

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TXGridTableParams>()
  const { error, loading, data } = useQuery(GET_SEASONS, {
    variables: { where: {} },
  })
  // org: { urlSlug: organizationSlug }
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

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper>
            <Toolbar className={classes.toolbarForm}>
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
            </Toolbar>
          </Paper>
          {loading && !error && <Loader />}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.seasons, 'seasonId')}
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
