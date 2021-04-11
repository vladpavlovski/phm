import React from 'react'
import PropTypes from 'prop-types'
import Img from 'react-cool-img'
import { useStyles } from './styled'

const XGridLogo = props => {
  const { src, placeholder, alt } = props
  const classes = useStyles()

  return (
    <Img
      placeholder={placeholder}
      src={src}
      className={classes.xGridLogo}
      alt={alt}
    />
  )
}

XGridLogo.propTypes = {
  src: PropTypes.string,
  placeholder: PropTypes.string,
  alt: PropTypes.string,
}

export { XGridLogo }
