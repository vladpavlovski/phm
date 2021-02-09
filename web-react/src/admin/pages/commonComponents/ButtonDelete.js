import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import LoadingButton from '@material-ui/lab/LoadingButton'
import DeleteForever from '@material-ui/icons/DeleteForever'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const ButtonDelete = props => {
  const { onClick, className, loading } = props

  const [openDialog, setOpenDialog] = useState(false)

  const handleClose = useCallback(() => {
    setOpenDialog(false)
  }, [])
  return (
    <>
      <LoadingButton
        type="button"
        variant="contained"
        color="secondary"
        onClick={() => {
          setOpenDialog(true)
        }}
        className={className}
        startIcon={<DeleteForever />}
        pending={loading}
        pendingPosition="start"
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
              onClick()
            }}
          >
            Sure, delete it!
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

ButtonDelete.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

export { ButtonDelete }
