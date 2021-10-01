import React, { useContext, useEffect } from 'react'

import { Grid } from '@mui/material'

import LayoutContext from '../../../../context/layout'
import { Helmet } from 'react-helmet'

import XGridTable from './XGrid'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Teams')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Teams</title>
      </Helmet>
      <Grid item xs={12}>
        <XGridTable />
      </Grid>
    </Grid>
  )
}

export { View as default }
