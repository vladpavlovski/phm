import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@mui/material/Typography'

const TitleComponent = props => (
  <Typography
    {...props}
    component="h2"
    variant="h6"
    color="primary"
    gutterBottom
  >
    {props.children}
  </Typography>
)

TitleComponent.propTypes = {
  children: PropTypes.node,
}

const Title = React.memo(TitleComponent)
export { Title }
