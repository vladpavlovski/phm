import React, { useCallback, useMemo, useRef } from 'react'
import { gql, useQuery } from '@apollo/client'
import { Container, Grid, Paper } from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import EditIcon from '@material-ui/icons/Edit'
import AddIcon from '@material-ui/icons/Add'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../commonComponents/styled'
import { getAdminAssociationRoute } from '../../../../routes'
import { LinkButton } from '../../../../components/LinkButton'
import { Title } from '../../../../components/Title'
import { Error } from '../../../../components/Error'
import { useWindowSize } from '../../../../utils/hooks'
// import { Loader } from '../../../../components/Loader'
import { setIdFromEntityId } from '../../../../utils'

const READ_ASSOCIATIONS = gql`
  query getAssociations {
    associations: Association {
      associationId
      name
      nick
    }
  }
`

const XGridTable = () => {
  const classes = useStyles()

  const { error, loading, data } = useQuery(READ_ASSOCIATIONS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  })

  // console.log('data:', data)

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
        field: 'associationId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<EditIcon />}
              to={getAdminAssociationRoute(params.value)}
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
  const getXGridHeight = useCallback(() => {
    const position = toolbarRef.current.getBoundingClientRect()
    const result = windowSize.height - position.bottom - 100
    return result
  }, [windowSize])

  return (
    <Container maxWidth="lg" className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                <Title>{'Associations'}</Title>
              </div>
              <div>
                <LinkButton
                  startIcon={<AddIcon />}
                  to={getAdminAssociationRoute('new')}
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
              style={{ height: getXGridHeight() }}
              className={classes.xGridWrapper}
            >
              <XGrid
                columns={columns}
                rows={setIdFromEntityId(data.associations, 'associationId')}
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
