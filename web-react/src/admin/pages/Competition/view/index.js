import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import Table from './Table'

import LayoutContext from '../../../../context/layout'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Competitions')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Competitions</title>
      </Helmet>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export { View as default }
