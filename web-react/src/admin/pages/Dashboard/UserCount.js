import React from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Title from './Title'
// import { useQuery, gql } from '@apollo/client'

const useStyles = makeStyles({
  depositContext: {
    flex: 1,
  },
  navLink: {
    textDecoration: 'none',
  },
})

// const GET_COUNT_QUERY = gql`
//   {
//     userCount
//   }
// `

export default function Deposits() {
  const classes = useStyles()

  // const { loading, error, data } = useQuery(GET_COUNT_QUERY)
  // if (error) return <p>Error</p>
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
