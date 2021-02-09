import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
  },
  submit: {
    margin: `0 ${theme.spacing(1)} !important`,
  },
  teamLogoView: {
    width: '6rem',
    height: '6rem',
  },
  toolbarForm: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  accordionWrapper: {
    paddingTop: theme.spacing(4),
  },
  accordionFormTitle: {
    width: '24%',
    flexShrink: 0,
  },
  accordionFormDescription: { color: theme.palette.grey[500] },
}))

export { useStyles }
