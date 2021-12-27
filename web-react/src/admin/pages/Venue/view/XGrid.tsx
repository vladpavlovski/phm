import React from 'react'
import { gql, useQuery } from '@apollo/client'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { useParams } from 'react-router-dom'
import { getAdminOrgVenueRoute } from 'router/routes'
import { LinkButton, Title, Error, Loader } from 'components'

import { setIdFromEntityId } from 'utils'

export const GET_VENUES = gql`
  query getVenues {
    venues {
      venueId
      name
      nick
    }
  }
`

type TXGridTableParams = {
  organizationSlug: string
}

const XGridTable: React.FC = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams<TXGridTableParams>()
  const { error, loading, data } = useQuery(GET_VENUES)

  const columns = React.useMemo<GridColumns>(
    () => [
      {
        field: 'venueId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgVenueRoute(organizationSlug, params.value)}
            >
              Edit
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 200,
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
                <Title>{'Venues'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgVenueRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
          </Paper>
          {loading && <Loader />}
          {error && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: 'calc(100vh - 230px)' }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.venues, 'venueId')}
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
