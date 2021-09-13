import React from 'react'
import { gql, useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../commonComponents/styled'
import { getAdminOrgCompetitionRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId, getXGridHeight } from '../../../../utils'

const GET_COMPETITIONS = gql`
  query getOrganizations($where: CompetitionWhere) {
    competitions(where: $where) {
      competitionId
      name
      nick
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_COMPETITIONS, {
    variables: { where: { org: { urlSlug: organizationSlug } } },
  })

  const columns = React.useMemo(
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
        field: 'competitionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
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
  const toolbarRef = React.useRef()

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                <Title>{'Competitions'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminOrgCompetitionRoute(organizationSlug, 'new')}
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
              <XGrid
                columns={columns}
                rows={setIdFromEntityId(data.competitions, 'competitionId')}
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
