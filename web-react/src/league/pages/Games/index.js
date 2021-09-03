import React from 'react'
import Grid from '@material-ui/core/Grid'
import { Helmet } from 'react-helmet'
import XGrid from './XGrid'
import LayoutContext from '../../../context/layout'

const View = () => {
  const { setBarTitle } = React.useContext(LayoutContext)
  React.useEffect(() => {
    setBarTitle('Games')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Helmet>
        <title>Games</title>
      </Helmet>
      <Grid item xs={12}>
        <XGrid />
      </Grid>
    </Grid>
  )
}

export { View as default }
