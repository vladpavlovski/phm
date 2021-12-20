import React, { useContext, useEffect } from 'react'

import { Grid } from '@mui/material'
import { Helmet } from 'react-helmet-async'
import LayoutContext from '../../../../context/layout'
import XGridTable from './XGrid'

const Players: React.FC = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Players')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Players</title>
      </Helmet>
      <Grid item xs={12}>
        <XGridTable />
      </Grid>
    </Grid>
  )
}

export { Players as default }
