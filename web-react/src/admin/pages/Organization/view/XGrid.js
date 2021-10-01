import React, { useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrganizationRoute } from '../../../../router/routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId, getXGridHeight } from '../../../../utils'
import EditIcon from '@mui/icons-material/Edit'
import Tooltip from '@mui/material/Tooltip'

const GET_ORGANIZATIONS = gql`
  query getOrganizations {
    organizations {
      organizationId
      name
      nick
      urlSlug
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()

  const { error, loading, data } = useQuery(GET_ORGANIZATIONS)

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 350,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },
      {
        field: 'organizationId',
        headerName: 'Actions',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              icon
              to={getAdminOrganizationRoute(params.row?.urlSlug)}
            >
              <Tooltip arrow title="Edit" placement="top">
                <EditIcon />
              </Tooltip>
            </LinkButton>
          )
        },
      },
    ],
    []
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
                <Title>{'Organizations'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrganizationRoute('new')}
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
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data.organizations, 'organizationId')}
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
