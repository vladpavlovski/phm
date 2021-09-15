import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

const LinkButton = props => {
  const { icon, children, ...restProps } = props
  return icon ? (
    <IconButton {...restProps}>{children}</IconButton>
  ) : (
    <Button {...restProps}>{children}</Button>
  )
}

LinkButton.defaultProps = {
  size: 'small',
  variant: 'contained',
  color: 'primary',
  component: Link,
  icon: false,
}

LinkButton.propTypes = {
  size: PropTypes.string,
  variant: PropTypes.string,
  color: PropTypes.string,
  to: PropTypes.string,
}

export { LinkButton }
