import { makeStyles } from '@material-ui/core/styles'

const drawerWidth = '24rem'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex !important',
  },
  toolbar: {
    paddingRight: '24px !important', // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex !important',
    alignItems: 'center !important',
    justifyContent: 'flex-end !important',
    padding: '0 8px  !important',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    width: `calc(100% - ${55}px) !important`,
    transition: `${theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })} !important`,
  },
  appBarShift: {
    marginLeft: `${drawerWidth} !important`,
    width: `calc(100% - ${drawerWidth}) !important`,
    transition: `${theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })} !important`,
  },
  menuSubList: {
    paddingLeft: '18px !important',
    transition: `${theme.transitions.create(['padding'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })} !important`,
  },
  menuSubListShift: {
    paddingLeft: '8px !important',
    transition: `${theme.transitions.create(['padding'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })} !important`,
  },
  menuSubListItem: {
    padding: '2px 16px !important',
  },
  menuButton: {
    marginRight: '36px !important',
  },
  menuButtonHidden: {
    display: 'none !important',
  },
  title: {
    flexGrow: `1 !important`,
  },
  drawerPaper: {
    position: 'relative !important',
    whiteSpace: 'nowrap !important',
    width: `${drawerWidth} !important`,
    transition: `${theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    })} !important`,
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: `${theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    })} !important`,
    width: `${theme.spacing(7)} !important`,
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: '1 !important',
    height: '100vh !important',
    overflow: 'auto !important',
  },
  container: {
    paddingTop: `${theme.spacing(4)} !important`,
    paddingBottom: `${theme.spacing(4)} !important`,
  },
  paper: {
    padding: `${theme.spacing(2)} !important`,
    display: 'flex !important',
    overflow: 'auto !important',
    flexDirection: 'column !important',
  },
  fixedHeight: {
    height: '240px  !important',
  },
  navLink: {
    textDecoration: 'none !important',
    color: 'inherit !important',
  },
  appBarImage: {
    maxHeight: '75px  !important',
    paddingRight: '20px  !important',
  },
}))

export { useStyles }
