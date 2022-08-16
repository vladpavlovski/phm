import React from 'react'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import { Organizations } from './components/Organizations'

const Dashboard = () => {
  return (
    <Container maxWidth={false}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Organizations />
        </Grid>
      </Grid>
    </Container>
  )
}

export { Dashboard }
