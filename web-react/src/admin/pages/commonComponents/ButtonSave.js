import React from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'
import LoadingButton from '@material-ui/lab/LoadingButton'
import SaveIcon from '@material-ui/icons/Save'
import { useStyles } from './styled'

const ButtonSave = props => {
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

ButtonSave.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
}

export { ButtonSave }
