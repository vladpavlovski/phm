import React, { useContext, useEffect } from 'react'
import 'react-imported-component/macro'
import { Grid } from '@material-ui/core'

import Load from '../../../../utils/load'
import LayoutContext from '../../../../context/layout'
const Table = Load(() => import('./Table'))

const Teams = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Teams')
    return () => {
      setBarTitle('')
    }
  }, [])
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Table />
      </Grid>
    </Grid>
  )
}

export { Teams as default }
