import React, { useCallback, useState } from 'react'
import LoadingButton, { LoadingButtonProps } from '@mui/lab/LoadingButton'
import Button, { ButtonProps } from '@mui/material/Button'
import Dialog, { DialogProps } from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'

type TButtonDialog = Omit<DialogProps, 'open'> &
  ButtonProps &
  LoadingButtonProps & {
    onClick?: () => void
    onDialogClosePositive?: () => void
    onDialogCloseNegative?: () => void
    dialogTitle?: string
    dialogDescription?: string
    dialogNegativeText?: string
    dialogPositiveText?: string
    textLoading?: string
    text?: string
    icon?: React.ReactElement
  }

const ButtonDialog: React.FC<TButtonDialog> = props => {
  const {
    onDialogClosePositive,
    onDialogCloseNegative,
    onClick,
    loading,
    loadingPosition,
    text,
    icon,
    textLoading,
    dialogTitle,
    dialogDescription,
    dialogNegativeText,
    dialogPositiveText,
    startIcon,
    ...rest
  } = props

  const [openDialog, setOpenDialog] = useState(false)

  const handleClose = useCallback(() => {
    setOpenDialog(false)
  }, [])
  return (
    <>
      {icon ? (
        <IconButton
          onClick={() => {
            setOpenDialog(true)
            onClick && onClick()
          }}
          {...rest}
        >
          {icon}
        </IconButton>
      ) : (
        <LoadingButton
          {...rest}
          onClick={() => {
            setOpenDialog(true)
            onClick && onClick()
          }}
          loadingPosition={startIcon ? loadingPosition : undefined}
          startIcon={startIcon}
          loading={loading}
        >
          {loading ? textLoading : text}
        </LoadingButton>
      )}
      {openDialog && (
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
      )}
    </>
  )
}

ButtonDialog.defaultProps = {
  loading: false,
  text: 'Button',
  textLoading: 'Loading...',
  type: 'button',
  variant: 'outlined',
  loadingPosition: 'start',
  color: 'secondary',
  dialogTitle: 'Do you really want to delete it?',
  dialogDescription:
    'This action will permanently delete this entity. Are you sure?',
  dialogNegativeText: 'No, leave it',
  dialogPositiveText: 'Sure, delete it!',
}

export { ButtonDialog }
