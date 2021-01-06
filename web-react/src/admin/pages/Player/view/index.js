import React from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'

import Load from '../../../../utils/load'
const PlayersTable = Load(() => import('./PlayersTable'))

const Players = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <PlayersTable />
      </Grid>
    </Grid>
  )
}

export { Players as default }
