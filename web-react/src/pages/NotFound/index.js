import React from 'react'
import { Button, Paper, Typography } from '@material-ui/core'
import { Home, ArrowBack } from '@material-ui/icons'

import { makeStyles } from '@material-ui/core/styles'
import { LinkButton } from '../../components/LinkButton'
import { useHistory } from 'react-router-dom'

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

const PageNotFound = () => {
  const classes = useStyles()
  const history = useHistory()
  return (
    <Paper className={classes.paper}>
      <div className={classes.container}>
        <Typography variant="h4">404</Typography>
        <Typography variant="subtitle1">{'Page Not Found'}</Typography>
        <div className={classes.buttonWrapper}>
          <LinkButton aria-label="home" to="/" className={classes.button}>
            <Home />
          </LinkButton>
          <Button
            aria-label="back"
            variant="contained"
            onClick={() => {
              history.goBack()
            }}
            className={classes.button}
          >
            <ArrowBack />
          </Button>
        </div>
      </div>
    </Paper>
  )
}

export default PageNotFound
