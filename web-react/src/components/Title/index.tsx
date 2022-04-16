import React from 'react'
import Typography, { TypographyProps } from '@mui/material/Typography'

const TitleComponent = (props: TypographyProps) => (
  <Typography {...props}>{props.children}</Typography>
)

TitleComponent.defaultProps = {
  component: 'h2',
  variant: 'h6',
  color: 'primary',
  gutterBottom: true,
}

const Title = React.memo(TitleComponent)
export { Title }
