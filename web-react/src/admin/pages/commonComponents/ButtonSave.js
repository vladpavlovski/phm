import React from 'react'
import PropTypes from 'prop-types'
import LoadingButton from '@material-ui/lab/LoadingButton'
import SaveIcon from '@material-ui/icons/Save'

const ButtonSave = props => {
  const { loading, className } = props
  return (
    <LoadingButton
      type="submit"
      variant="contained"
      color="primary"
      className={className}
      startIcon={<SaveIcon />}
      pending={loading}
      pendingPosition="start"
    >
      {loading ? 'Saving...' : 'Save'}
    </LoadingButton>
  )
}

ButtonSave.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
}

export { ButtonSave }
