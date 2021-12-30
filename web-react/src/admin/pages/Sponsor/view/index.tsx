import React, { useContext, useEffect } from 'react'

import { Grid } from '@mui/material'

import LayoutContext from 'context/layout'
import { Helmet } from 'react-helmet-async'

import XGridTable from './XGrid'

const View: React.FC = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Sponsors')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Sponsors</title>
      </Helmet>
      <Grid item xs={12}>
        <XGridTable />
      </Grid>
    </Grid>
  )
}

export { View as default }
