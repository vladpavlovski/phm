import React, { useContext, useEffect } from 'react'

import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'
import XGrid from './XGrid'

import LayoutContext from '../../../../context/layout'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Events')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Events</title>
      </Helmet>
      <Grid item xs={12}>
        <XGrid />
      </Grid>
    </Grid>
  )
}

export { View as default }
