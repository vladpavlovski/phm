import React, { useContext, useEffect } from 'react'

import { Grid } from '@mui/material'
import { Helmet } from 'react-helmet'

import LayoutContext from '../../../../context/layout'
import XGridTable from './XGrid'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Organizations')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <>
      <Helmet>
        <title>Organizations</title>
      </Helmet>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <XGridTable />
        </Grid>
      </Grid>
    </>
  )
}

export { View as default }
