import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'

import LayoutContext from '../../../../context/layout'
import { Helmet } from 'react-helmet'

import Table from './Table'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Venues')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Venues</title>
      </Helmet>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export { View as default }
