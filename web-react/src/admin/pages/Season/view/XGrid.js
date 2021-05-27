import React, { useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import dayjs from 'dayjs'
import { useParams } from 'react-router-dom'
import { Container, Grid, Paper } from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgSeasonRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
// import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId, getXGridHeight } from '../../../../utils'

const GET_SEASONS = gql`
  query getSeasons($organizationSlug: String!) {
    seasons: seasonsByOrganization(organizationSlug: $organizationSlug) {
      seasonId
      name
      startDate {
        formatted
      }
      endDate {
        formatted
      }
      nick
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_SEASONS, {
    variables: { organizationSlug },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  })

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },
      {
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => {
          return params.row.startDate.formatted
        },
        valueFormatter: params => {
          return dayjs(params.value).format('LL')
        },
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => {
          return params.row.endDate.formatted
        },
        valueFormatter: params => {
          return dayjs(params.value).format('LL')
        },
      },
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
    ],
    [organizationSlug]
  )

  const windowSize = useWindowSize()
  const toolbarRef = useRef()

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
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
          {/* {loading && !error && <Loader />} */}
          {error && !loading && <Error message={error.message} />}
          {data && (
            <div
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <XGrid
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
