import React, { useContext, useEffect } from 'react'
import { useTheme } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

import LayoutContext from '../../../context/layout'

import UserCount from './UserCount'
import { useStyles } from '../commonComponents/styled'
import { Organizations } from './components/Organizations'

export default function Dashboard() {
  const theme = useTheme()

  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Dashboard')
    return () => {
      setBarTitle('')
    }
  }, [])

  const classes = useStyles(theme)

  return (
    <Container maxWidth="lg" className={classes.container}>
      <React.Fragment>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8} lg={7}>
            <Paper className={classes.paper}>
              <Organizations />
            </Paper>
          </Grid>
          {/* User Count */}
          <Grid item xs={12} md={4} lg={5}>
            <Paper className={classes.paper}>
              <UserCount />
            </Paper>
          </Grid>
          {/* Recent Reviews */}
          <Grid item xs={12}>
            <Paper className={classes.paper}></Paper>
          </Grid>
        </Grid>
      </React.Fragment>
    </Container>
  )
}
