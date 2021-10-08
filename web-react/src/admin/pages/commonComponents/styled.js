import { makeStyles } from '@mui/styles'

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
    width: '4rem',
    height: '4rem',
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
  xGridWrapper: {
    width: '100%',
    marginTop: theme.spacing(4),
    background: theme.palette.background.paper,
  },
  xGridDialog: {
    width: '100%',
  },
  logo: {
    width: '100%',
  },
  xGridLogo: {
    width: '6rem',
    height: '6rem',
  },
  gameTeamLogoWrapper: {
    display: 'flex',
    justifyContent: 'center',
  },
  gameTeamLogo: {
    maxWidth: '20rem',
    maxHeight: '20rem',
  },
  gamePlayScore: {
    [theme.breakpoints.up('xs')]: {
      fontSize: '2.5rem !important',
    },
    [theme.breakpoints.up('sm')]: {
      fontSize: '4rem !important',
    },
    [theme.breakpoints.up('md')]: {
      fontSize: '7rem !important',
    },
    [theme.breakpoints.up('lg')]: {
      fontSize: '8rem !important',
    },
  },
  gamePlayTeamLogo: {
    [theme.breakpoints.up('xs')]: {
      width: '3rem',
      height: '3rem',
    },
    [theme.breakpoints.up('sm')]: {
      width: '6rem',
      height: '6rem',
    },
    [theme.breakpoints.up('md')]: {
      width: '8rem',
      height: '8rem',
    },
    [theme.breakpoints.up('lg')]: {
      width: '10rem',
      height: '10rem',
    },
  },
}))

export { useStyles }
