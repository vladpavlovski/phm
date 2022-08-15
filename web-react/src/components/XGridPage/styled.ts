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
}))

export { useStyles }
