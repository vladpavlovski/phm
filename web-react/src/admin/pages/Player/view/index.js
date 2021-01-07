import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'

import Load from '../../../../utils/load'
import LayoutContext from '../../../../context/layout'
const PlayersTable = Load(() => import('./PlayersTable'))

const Players = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Players')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <PlayersTable />
      </Grid>
    </Grid>
  )
}

export { Players as default }
