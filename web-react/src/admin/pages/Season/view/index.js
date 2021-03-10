import React, { useContext, useEffect } from 'react'

import { Grid } from '@material-ui/core'

import LayoutContext from '../../../../context/layout'
import { Helmet } from 'react-helmet'

import XGrid from './XGrid'

const View = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Seasons')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Seasons</title>
      </Helmet>
      <Grid item xs={12}>
        <XGrid />
      </Grid>
    </Grid>
  )
}

export { View as default }
