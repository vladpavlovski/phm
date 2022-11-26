import React from 'react'
import { Link } from 'react-router-dom'
import { ButtonProps, ButtonTypeMap } from '@mui/material'
import Button from '@mui/material/Button'
import { ExtendButtonBase } from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'

interface ILinkButton extends ButtonProps {
  icon?: boolean
  component?: React.ReactNode
  to?: string
  href?: string
  target?: string
}

const LinkButton: React.FC<ILinkButton> = props => {
  const { icon, children, ...restProps } = props
  const WrapTag: ExtendButtonBase<ButtonTypeMap> = icon ? IconButton : Button
  return <WrapTag {...restProps}>{children}</WrapTag>
}

LinkButton.defaultProps = {
  size: 'small',
  variant: 'contained',
  color: 'primary',
  component: Link,
  icon: false,
}

export { LinkButton }
