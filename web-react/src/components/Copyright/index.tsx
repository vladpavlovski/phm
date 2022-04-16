import React from 'react'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'

const CopyrightComponent = () => (
  <Typography variant="body2" color="textSecondary" align="center">
    {'Copyright © '}
    <Link color="inherit" href="https://phmcup.cz/">
      HMS - Hockey Management System
    </Link>{' '}
    {new Date().getFullYear()}
    {'.'}
  </Typography>
)

const Copyright = React.memo(CopyrightComponent)

export { Copyright }
