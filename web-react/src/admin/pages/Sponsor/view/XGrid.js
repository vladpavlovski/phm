import React, { useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import { Container, Grid, Paper } from '@mui/material'
import Toolbar from '@mui/material/Toolbar'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgSponsorRoute } from '../../../../router/routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId, getXGridHeight } from '../../../../utils'

const GET_SPONSORS = gql`
  query getSponsors {
    sponsors {
      sponsorId
      name
      legalName
      nick
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_SPONSORS)

  const columns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
      },
      {
        field: 'legalName',
        headerName: 'Legal Name',
        width: 250,
      },
      {
        field: 'nick',
        headerName: 'Nick',
        width: 150,
      },

      {
        field: 'sponsorId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgSponsorRoute(organizationSlug, params.value)}
            >
              Edit
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
                <Title>{'Sponsors'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgSponsorRoute(organizationSlug, 'new')}
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
              style={{ height: getXGridHeight(toolbarRef.current, windowSize) }}
              className={classes.xGridWrapper}
            >
              <DataGridPro
                columns={columns}
                rows={setIdFromEntityId(data?.sponsors, 'sponsorId')}
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
