import clsx from 'clsx'
import React, { useCallback, useState } from 'react'
import DeleteForever from '@mui/icons-material/DeleteForever'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import Button from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'

type TButtonDelete = LoadingButtonProps &
  Omit<DialogProps, 'open'> & {
    onClick: () => void
  }

const ButtonDelete: React.FC<TButtonDelete> = props => {
  const { onClick, className, loading, color, size, variant } = props

  const [openDialog, setOpenDialog] = useState(false)

  const handleClose = useCallback(() => {
    setOpenDialog(false)
  }, [])
  return (
    <>
      <LoadingButton
        size={size}
        type="button"
        variant={variant}
        color={color}
        onClick={() => {
          setOpenDialog(true)
        }}
        className={clsx(className)}
        startIcon={<DeleteForever />}
        loading={loading}
        loadingPosition="start"
      >
        {loading ? 'Deleting...' : 'Delete'}
      </LoadingButton>
      {openDialog && (
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
      )}
    </>
  )
}

ButtonDelete.defaultProps = {
  loading: false,
  className: '',
  color: 'secondary',
  size: 'medium',
  variant: 'outlined',
}

export { ButtonDelete }
