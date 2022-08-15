import { makeStyles } from '@mui/styles'
import { Theme } from '@mui/system'

const useStyles = makeStyles((theme: Theme) => ({
  xGridWrapper: {
    width: '100%',
    marginTop: theme.spacing(3),
    background: theme.palette.background.paper,
    '& .hms-iframe--header': {
      padding: '0 !important',
      minWidth: '30px !important',
      width: '30px !important',
    },
    '& .hms-iframe--cell': {
      padding: '0 !important',
      minWidth: '30px !important',
      width: '30px !important',
    },

    '& .hms-iframe--header .MuiDataGrid-columnHeaderTitleContainer': {
      padding: 0,
    },
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
