import React, { useMemo, useRef } from 'react'
import { useQuery } from '@apollo/client'
import { useParams } from 'react-router-dom'

import { Container, Grid, Paper } from '@material-ui/core'
import Toolbar from '@material-ui/core/Toolbar'
import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { useStyles } from '../../../admin/pages/commonComponents/styled'
import { Title } from '../../../components/Title'
import { Error } from '../../../components/Error'
import { useWindowSize } from '../../../utils/hooks'
import { Loader } from '../../../components/Loader'
import { setIdFromEntityId, getXGridHeight } from '../../../utils'

import { GET_GAMES, getColumns } from '../../../admin/pages/Game/view/XGrid'

const XGridTable = () => {
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const { error, loading, data } = useQuery(GET_GAMES, {
    variables: {
      where: {
        org: {
          urlSlug: organizationSlug,
        },
      },
      whereGameEvents: {
        eventTypeCode: 'goal',
      },
    },
  })

  const columns = useMemo(() => {
    const cols = getColumns(organizationSlug)

    return cols.filter(c => c.field !== 'gameId')
  }, [organizationSlug])

  const windowSize = useWindowSize()
  const toolbarRef = useRef()

  return (
    <Container maxWidth={false} className={classes.container}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={12}>
          <Paper className={classes.root}>
            <Toolbar ref={toolbarRef} className={classes.toolbarForm}>
              <div>
                <Title>{'Games'}</Title>
              </div>
              <div></div>
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
                density="compact"
                columns={columns}
                rows={setIdFromEntityId(data.games, 'gameId')}
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
