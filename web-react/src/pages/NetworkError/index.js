import React from 'react'
import { Paper, Typography } from '@material-ui/core'
import { Refresh } from '@material-ui/icons'

import { makeStyles } from '@material-ui/core/styles'
import { LinkButton } from '../../components/LinkButton'

const useStyles = makeStyles(theme => ({
  icon: {
    width: 192,
    height: 192,
    color: theme.palette.secondary.main,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: `100%`,
  },
  buttonWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.default,
    margin: 0,
    height: `calc(100vh - 64px)`,
  },
  button: {
    margin: theme.spacing(2),
    fontSize: 40,
  },
}))

const NetworkError = () => {
  const classes = useStyles()
  return (
    <Paper className={classes.paper}>
      <div className={classes.container}>
        <Typography variant="h4">Oh shucks!</Typography>
        <Typography variant="subtitle1">
          {'Some Network Error occurred. The server may be at fault'}
        </Typography>
        <div className={classes.buttonWrapper}>
          <LinkButton aria-label="home" to="/" className={classes.button}>
            <Refresh />
          </LinkButton>
        </div>
      </div>
    </Paper>
  )
}

export default NetworkError