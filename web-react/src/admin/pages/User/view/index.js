import React, { useContext, useEffect } from 'react'

import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import LayoutContext from '../../../../context/layout'
import XGrid from './XGrid'

const Users = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Users')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Users</title>
      </Helmet>
      <Grid item xs={12}>
        <XGrid />
      </Grid>
    </Grid>
  )
}

export { Users as default }
