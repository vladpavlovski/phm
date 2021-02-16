import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'

import LayoutContext from '../../../../context/layout'
import Table from './Table'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Associations')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <>
      <Helmet>
        <title>Associations</title>
      </Helmet>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Table />
        </Grid>
      </Grid>
    </>
  )
}

export { View as default }
