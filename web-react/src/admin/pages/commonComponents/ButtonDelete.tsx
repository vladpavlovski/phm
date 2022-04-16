import React, { useState, useCallback } from 'react'
import clsx from 'clsx'

import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import DeleteForever from '@mui/icons-material/DeleteForever'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

import { useStyles } from './styled'

type TButtonDelete = LoadingButtonProps &
  Omit<DialogProps, 'open'> & {
    onClick: () => void
  }

const ButtonDelete: React.FC<TButtonDelete> = props => {
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
}

export { ButtonDelete }
