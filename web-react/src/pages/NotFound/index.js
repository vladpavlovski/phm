import React from 'react'
import { Button, Paper, Typography } from '@mui/material'
import { Home, ArrowBack } from '@mui/icons-material'

import { makeStyles } from '@mui/styles'
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
  button: {
    margin: theme.spacing(2),
    fontSize: 40,
  },
}))

const PageNotFound = () => {
  const history = useHistory()
  return (
    <Paper sx={{ p: '16px' }}>
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
