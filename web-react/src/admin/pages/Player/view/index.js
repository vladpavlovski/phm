import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import LayoutContext from '../../../../context/layout'
import Table from './Table'

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
      <Helmet>
        <title>Players</title>
      </Helmet>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export { Players as default }
