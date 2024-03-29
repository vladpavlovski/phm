import dayjs from 'dayjs'
import { useSnackbar } from 'notistack'
import React, { useCallback, useState } from 'react'
import Compress from 'react-image-file-resizer'
import CloseIcon from '@mui/icons-material/Close'
import { ButtonProps } from '@mui/material'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { DropzoneDialogBase, DropzoneDialogBaseProps } from '../material-ui-dropzone'

const formatFileName = (filename = '', folderName = 'common') => {
  const date = dayjs().format('YYYY-MM-DD')
  const randomString = Math.random().toString(36).substring(2, 7)
  const fileExtension = filename.toLowerCase().split('.').pop()
  const cleanFileName = filename
    .replace(/[^a-z0-9]/g, '-')
    .toLowerCase()
    .substr(0, filename.lastIndexOf('.'))
  const newFilename = `${folderName}/${date}-${randomString}-${cleanFileName}.${fileExtension}`
  return newFilename
}

type TUploader = Omit<DropzoneDialogBaseProps, 'fileObjects'> & {
  onSubmit: (url: string, fileName: string) => void
  filesLimit?: number
  buttonProps?: ButtonProps
  buttonText: string
  folderName: string
}

type TFileObjects = {
  file: File
  data: string | ArrayBuffer | null
  name?: string
}[]

type BlobPart = string | Blob | ArrayBufferView | ArrayBuffer

const Uploader: React.FC<TUploader> = props => {
  const { buttonProps, buttonText, filesLimit, onSubmit, folderName, ...rest } =
    props
  const [open, setOpen] = useState(false)
  const [fileObjects, setFileObjects] = useState<TFileObjects>([])

  const { enqueueSnackbar } = useSnackbar()

  const onSave = useCallback(async () => {
    const fileToUpload: { file: { name: string; type: string } } =
      fileObjects?.[0]

    const presignDataResponse = await fetch('/signs3', {
      method: 'POST',
      body: JSON.stringify({
        filename: formatFileName(fileToUpload?.file?.name || '', folderName),
        filetype: fileToUpload?.file?.type,
      }),
    })
    const presignData = await presignDataResponse.json()
    const { signedRequest, url } = presignData

    fetch(signedRequest, {
      method: 'PUT',
      body: fileObjects?.[0]?.file,
    })
      .then(response => {
        if (response?.status === 200) {
          onSubmit(url, fileToUpload?.file?.name?.split('.')?.[0] || '')
          onClose()
          enqueueSnackbar('🎉 File successfully upload!', {
            variant: 'success',
          })
        }
      })
      .catch(e => {
        console.error(e)
        enqueueSnackbar(e, { variant: 'error' })
      })
  }, [fileObjects, folderName])

  const onClose = useCallback(() => {
    setOpen(false)
    setFileObjects([])
  }, [])

  const onDelete = useCallback(deleteFile => {
    setFileObjects(state => state.filter(file => file.name !== deleteFile.name))
  }, [])

  const onAdd = useCallback(newFiles => {
    const fileObject = newFiles[0]
    // const compressedImages = []
    Compress.imageFileResizer(
      fileObject.file, // the file from input
      1080, // width
      1080, // height
      'WEBP', // compress format WEBP, JPEG, PNG
      70, // quality
      0, // rotation
      (blob: string | Blob | File | ProgressEvent<FileReader>): void => {
        // You upload logic goes here
        const fileName = fileObject.file.name
          .substr(0, fileObject.file.name.lastIndexOf('.'))
          .toLowerCase()
        const newFile = new File([blob as BlobPart], `${fileName}.webp`, {
          type: 'image/webp',
        })
        setFileObjects(state => [
          ...state,
          { file: newFile, data: fileObject.data },
        ])
      },
      'blob' // blob or base64 default base64
    )
  }, [])

  const dialogTitle = useCallback(
    () => (
      <>
        <span>Upload file</span>
        <IconButton
          style={{ right: '12px', top: '8px', position: 'absolute' }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      </>
    ),
    []
  )

  return (
    <>
      <Button type="button" {...buttonProps} onClick={() => setOpen(true)}>
        {buttonText}
      </Button>

      <DropzoneDialogBase
        {...rest}
        dialogTitle={dialogTitle()}
        fileObjects={fileObjects}
        open={open}
        onAdd={onAdd}
        onDelete={onDelete}
        onClose={onClose}
        onSave={() => {
          onSave()
        }}
        dropzoneProps={{
          disabled: filesLimit ? fileObjects.length >= filesLimit : true,
        }}
      />
    </>
  )
}

Uploader.defaultProps = {
  buttonProps: {
    variant: 'contained',
    color: 'primary',
    fullWidth: true,
  },
  buttonText: 'Upload',
  cancelButtonText: 'Cancel',
  submitButtonText: 'Submit',
  acceptedFiles: ['image/*'],
  showPreviews: true,
  showFileNamesInPreview: true,
  maxFileSize: 5000000,
  showAlerts: false,
  filesLimit: 1,
  disableRejectionFeedback: true,
  folderName: 'common',
}

export { Uploader }
