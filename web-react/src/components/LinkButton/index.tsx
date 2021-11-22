import React from 'react'
import { Link } from 'react-router-dom'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'

import { ExtendButtonBase } from '@mui/material/ButtonBase'
import { ButtonTypeMap, ButtonProps } from '@mui/material'

interface ILinkButton extends ButtonProps {
  icon?: boolean
  component?: React.ReactNode
  to: string
  target?: string
}

const LinkButton: React.FC<ILinkButton> = props => {
  const { icon, children, ...restProps } = props
  const WrapTag = React.useMemo(
    (): ExtendButtonBase<ButtonTypeMap> => (icon ? IconButton : Button),
    [icon]
  )
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
