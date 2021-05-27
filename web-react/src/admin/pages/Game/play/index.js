import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/client'
import { Helmet } from 'react-helmet'

import Container from '@material-ui/core/Container'
import Paper from '@material-ui/core/Paper'
import { Grid } from '@material-ui/core'
import Typography from '@material-ui/core/Typography'
import Toolbar from '@material-ui/core/Toolbar'

import { useStyles } from '../../commonComponents/styled'
import { Title } from '../../../../components/Title'
import { Loader } from '../../../../components/Loader'
import { Error } from '../../../../components/Error'

import { formatDate, formatTime } from '../../../../utils'

import { GET_GAME } from '../index'

import { Periods, Timer } from './components'

const Play = () => {
  const classes = useStyles()
  const { gameId } = useParams()

  const {
    loading: queryLoading,
    data: queryData,
    error: queryError,
  } = useQuery(GET_GAME, {
    fetchPolicy: 'network-only',
    variables: { gameId },
    skip: gameId === 'new',
  })

  const gameData = queryData?.game[0] || {}
  useEffect(() => {
    console.log('gameData:', gameData)
  }, [gameData])
  return (
    <Container maxWidth={false} className={classes.container}>
      <Helmet>
        <title>{`Game Live ${gameData?.name || ''}`}</title>
      </Helmet>
      {queryLoading && !queryError && <Loader />}
      {queryError && !queryLoading && <Error message={queryError.message} />}

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper className={classes.paper}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                flexShrink: 3,
              }}
            >
              <Typography variant="h6" component="div">
                {gameData?.name}
              </Typography>
              <Typography variant="h6" component="div">
                {gameData?.type}
              </Typography>
              <Typography variant="h6" component="div">
                {formatDate(gameData?.startDate?.formatted)} -{' '}
                {formatDate(gameData?.endDate?.formatted)}
              </Typography>
              <Typography variant="h6" component="div">
                {formatTime(gameData?.startTime?.formatted)} -{' '}
                {formatTime(gameData?.endTime?.formatted)}
              </Typography>
            </div>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper className={classes.paper}>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div>
                <Title>{'Host team'}</Title>
              </div>
              <div></div>
            </Toolbar>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper className={classes.paper}>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div>
                <Title>{'Live game'}</Title>
              </div>
              <div></div>
            </Toolbar>
            <Grid container>
              <Grid item xs={12}>
                <Periods />
                <Timer />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper className={classes.paper}>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div>
                <Title>{'Guest team'}</Title>
              </div>
              <div></div>
            </Toolbar>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Play
