import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    // display: 'flex',
    // overflow: 'auto',
    // flexDirection: 'row',

    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      marginLeft: 0,
    },
  },
}))

export { useStyles }
