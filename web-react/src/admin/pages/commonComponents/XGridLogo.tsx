import React from 'react'
import Img from 'react-cool-img'
import { useStyles } from './styled'

type TXGridLogo = {
  src: string
  placeholder: string
  alt: string
}

const XGridLogo: React.FC<TXGridLogo> = props => {
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

export { XGridLogo }
