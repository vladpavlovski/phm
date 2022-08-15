import React from 'react'
import Img from 'react-cool-img'

type TXGridLogo = {
  src: string
  placeholder: string
  alt: string
}

const XGridLogo: React.FC<TXGridLogo> = props => {
  const { src, placeholder, alt } = props

  return (
    <Img
      placeholder={placeholder}
      src={src}
      style={{ width: '6rem', height: '6rem' }}
      alt={alt}
    />
  )
}

export { XGridLogo }
