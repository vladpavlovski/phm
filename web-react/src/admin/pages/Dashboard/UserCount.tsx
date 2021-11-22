import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Title from './Title'

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  navLink: {
    textDecoration: 'none',
  },
})

export default function Deposits() {
  const classes = useStyles()

  return (
    <React.Fragment>
      <Title>Total Users</Title>
      <Typography component="p" variant="h4">
        {0}
      </Typography>
      <Typography color="textSecondary" className={classes.depositContext}>
        users found
      </Typography>
      <div>
        <Link to="/users" className={classes.navLink}>
          View users
        </Link>
      </div>
    </React.Fragment>
  )
}
