import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import clsx from 'clsx'

import LoadingButton from '@material-ui/lab/LoadingButton'
import DeleteForever from '@material-ui/icons/DeleteForever'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

import { useStyles } from './styled'

const ButtonDelete = props => {
  const { onClick, className, loading } = props
  const classes = useStyles()

  const [openDialog, setOpenDialog] = useState(false)

  const handleClose = useCallback(() => {
    setOpenDialog(false)
  }, [])
  return (
    <>
      <LoadingButton
        type="button"
        variant="outlined"
        color="secondary"
        onClick={() => {
          setOpenDialog(true)
        }}
        className={clsx(className, classes.submit)}
        startIcon={<DeleteForever />}
        loading={loading}
        loadingPosition="start"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </LoadingButton>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {'Do you really want to delete it?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This action will permanently delete this entity. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No, leave it</Button>
          <Button
            onClick={() => {
              handleClose()
              onClick && onClick()
            }}
          >
            Sure, delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

ButtonDelete.defaultProps = {
  loading: false,
  className: '',
  onClick: null,
}

ButtonDelete.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export { ButtonDelete }
