import Typography, { TypographyProps } from '@mui/material/Typography'

const Title = (props: TypographyProps) => (
  <Typography {...props}>{props.children}</Typography>
)

Title.defaultProps = {
  component: 'h2',
  variant: 'h6',
  color: 'primary',
  gutterBottom: true,
}

export { Title }
