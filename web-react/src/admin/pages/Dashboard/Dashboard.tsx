import React, { useContext, useEffect } from 'react'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'

import LayoutContext from '../../../context/layout'
import { UserCount } from './UserCount'
import { Organizations } from './components/Organizations'

const Dashboard: React.FC = () => {
  const { setBarTitle } = useContext(LayoutContext)

  useEffect(() => {
    setBarTitle('Dashboard')
    return () => {
      setBarTitle('')
    }
  }, [])

  return (
    <Container maxWidth="lg">
      <Grid container spacing={4}>
        <Grid item xs={12} md={8} lg={7}>
          <Organizations />
        </Grid>
        <Grid item xs={12} md={4} lg={5}>
          <UserCount />
        </Grid>
      </Grid>
    </Container>
  )
}

export { Dashboard }
