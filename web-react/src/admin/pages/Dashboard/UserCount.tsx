import React from 'react'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { Title } from './Title'

const UserCount: React.FC = () => {
  return (
    <Paper sx={{ padding: '16px' }}>
      <Title>Total Users</Title>
      <Typography component="p" variant="h4">
        {0}
      </Typography>
      <Typography color="textSecondary">users found</Typography>
    </Paper>
  )
}

export { UserCount }
