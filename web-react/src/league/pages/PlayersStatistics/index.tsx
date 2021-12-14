import React from 'react'
import Grid from '@mui/material/Grid'
import XGridTable from './XGrid'

const View = () => (
  <Grid container spacing={2}>
    <Grid item xs={12}>
      <XGridTable />
    </Grid>
  </Grid>
)

export { View as default }
