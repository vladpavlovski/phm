import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Button } from '@material-ui/core'

const LinkButton = props => {
  return <Button {...props}>{props.children}</Button>
}

LinkButton.defaultProps = {
  size: 'small',
  variant: 'contained',
  color: 'primary',
  component: Link,
}

LinkButton.propTypes = {
  size: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
  to: PropTypes.string,
}

export { LinkButton }
