import { makeStyles } from '@mui/styles'

const useStyles = makeStyles(() => ({
  imageHover: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
}))

export { useStyles }
