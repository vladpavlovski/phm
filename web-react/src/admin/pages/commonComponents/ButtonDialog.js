import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'

import LoadingButton from '@material-ui/lab/LoadingButton'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'

const ButtonDialog = props => {
  const {
    onDialogClosePositive,
    onDialogCloseNegative,
    onClick,
    loading,
    text,
    textLoading,
    dialogTitle,
    dialogDescription,
    dialogNegativeText,
    dialogPositiveText,
    ...rest
  } = props

  const [openDialog, setOpenDialog] = useState(false)

  const handleClose = useCallback(() => {
    setOpenDialog(false)
  }, [])
  return (
    <>
      <LoadingButton
        {...rest}
        onClick={() => {
          setOpenDialog(true)
          onClick && onClick()
        }}
        pending={loading}
      >
        {loading ? textLoading : text}
      </LoadingButton>
      <Dialog
        open={openDialog}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {dialogDescription}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              handleClose()
              onDialogCloseNegative && onDialogCloseNegative()
            }}
          >
            {dialogNegativeText}
          </Button>
          <Button
            onClick={() => {
              handleClose()
              onDialogClosePositive && onDialogClosePositive()
            }}
          >
            {dialogPositiveText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

ButtonDialog.defaultProps = {
  loading: false,
  className: '',
  onClick: null,
  onDialogCloseNegative: null,
  onDialogClosePositive: null,
  text: 'Button',
  textLoading: 'Loading...',
  type: 'button',
  variant: 'outlined',
  pendingPosition: 'start',
  color: 'secondary',
  dialogTitle: 'Do you really want to delete it?',
  dialogDescription:
    'This action will permanently delete this entity. Are you sure?',
  dialogNegativeText: 'No, leave it',
  dialogPositiveText: 'Sure, delete it!',
}

ButtonDialog.propTypes = {
  loading: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  onDialogClosePositive: PropTypes.func,
  onDialogCloseNegative: PropTypes.func,
  text: PropTypes.string,
  textLoading: PropTypes.string,
  type: PropTypes.string,
  variant: PropTypes.string,
  pendingPosition: PropTypes.string,
  color: PropTypes.string,
  dialogTitle: PropTypes.string,
  dialogDescription: PropTypes.string,
  dialogNegativeText: PropTypes.string,
  dialogPositiveText: PropTypes.string,
}

export { ButtonDialog }