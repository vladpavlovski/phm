import React from 'react'
import Grid from '@mui/material/Grid'
import { Helmet } from 'react-helmet-async'
import XGridTable from './XGrid'

const View: React.FC = () => {
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Games</title>
      </Helmet>
      <Grid item xs={12}>
        <XGridTable />
      </Grid>
    </Grid>
  )
}

export { View as default }
