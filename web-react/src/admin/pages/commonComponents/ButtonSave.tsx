import React from 'react'
import clsx from 'clsx'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import SaveIcon from '@mui/icons-material/Save'
import { useStyles } from './styled'

const ButtonSave: React.FC<LoadingButtonProps> = props => {
  const { loading, className } = props
  const classes = useStyles()
  return (
    <LoadingButton
      type="submit"
      variant="contained"
      color="primary"
      className={clsx(className, classes.submit)}
      startIcon={<SaveIcon />}
      loading={loading}
      loadingPosition="start"
    >
      {loading ? 'Saving...' : 'Save'}
    </LoadingButton>
  )
}

ButtonSave.defaultProps = {
  loading: false,
  className: '',
}

export { ButtonSave }
