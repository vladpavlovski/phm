import React, { useContext, useEffect } from 'react'

import { Grid } from '@material-ui/core'
import { Helmet } from 'react-helmet'

import LayoutContext from '../../../../context/layout'
import XGrid from './XGrid'

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
          <XGrid />
        </Grid>
      </Grid>
    </>
  )
}

export { View as default }
