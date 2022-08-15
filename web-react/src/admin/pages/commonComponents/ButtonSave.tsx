import clsx from 'clsx'
import React from 'react'
import SaveIcon from '@mui/icons-material/Save'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'

const ButtonSave: React.FC<LoadingButtonProps> = props => {
  const { loading, className } = props
  return (
    <LoadingButton
      type="submit"
      variant="contained"
      color="primary"
      className={clsx(className)}
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
