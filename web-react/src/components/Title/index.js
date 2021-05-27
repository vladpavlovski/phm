import React from 'react'
import PropTypes from 'prop-types'
import Typography from '@material-ui/core/Typography'

const Title = props => (
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

Title.propTypes = {
  children: PropTypes.node,
}
export { Title }
