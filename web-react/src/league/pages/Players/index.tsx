import React from 'react'
import Grid from '@mui/material/Grid'
import { Helmet } from 'react-helmet-async'
import XGridTable from './XGrid'

const View: React.FC = () => {
  return (
    <Grid container spacing={2}>
      <Helmet>
        <title>Players</title>
      </Helmet>
      <Grid item xs={12}>
        <XGridTable />
      </Grid>
    </Grid>
  )
}

export { View as default }
