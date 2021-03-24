import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
// import { gql, useLazyQuery } from '@apollo/client'
import { useSnackbar } from 'notistack'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'

import { DropzoneDialogBase } from 'material-ui-dropzone'
import dayjs from 'dayjs'
import Compress from 'react-image-file-resizer'

// const S3_SIGN = gql`
//   query CustomSignS3($filename: String!, $filetype: String!) {
//     data: CustomSignS3(filename: $filename, filetype: $filetype) {
//       url
//       signedRequest
//     }
//   }
// `

const formatFileName = (filename, folderName = 'common') => {
  const date = dayjs().format('YYYY-MM-DD')
  const randomString = Math.random().toString(36).substring(2, 7)
  const fileExtension = filename.split('.').pop().toLowerCase()
  const cleanFileName = filename
    .substr(0, filename.lastIndexOf('.'))
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
  const newFilename = `${folderName}/${date}-${randomString}-${cleanFileName}.${fileExtension}`
  return newFilename.substring(0, 60)
}

const Uploader = props => {
  const {
    buttonProps,
    buttonText,
    filesLimit,
    onSubmit,
    folderName,
    ...rest
  } = props
  const [open, setOpen] = useState(false)
  const [fileObjects, setFileObjects] = useState([])

  const { enqueueSnackbar } = useSnackbar()

  // const [s3Sign] = useLazyQuery(S3_SIGN, {
  //   onCompleted: signedResponse => {
  //     const { signedRequest, url } = signedResponse?.data
  //   },
  // })

  const onSave = useCallback(async () => {
    const fileToUpload = fileObjects?.[0]

    const presignDataResponse = await fetch('http://localhost:34567/signs3', {
      method: 'POST',
      body: JSON.stringify({
        filename: formatFileName(fileToUpload?.file?.name, folderName),
        filetype: fileToUpload?.file?.type,
      }),
    })
    const presignData = presignDataResponse.json()
    console.log('presignData: ', presignData)
    const { signedRequest, url } = presignData

    fetch(signedRequest, {
      method: 'PUT',
      body: fileObjects?.[0]?.file,
    })
      .then(response => response.json())
      .then(response => {
        if (response?.status === 200) {
          onSubmit(url)
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

    // s3Sign({
    //   variables: {
    //     filename: formatFileName(fileToUpload?.file?.name, folderName),
    //     filetype: fileToUpload?.file?.type,
    //   },
    // })
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
      blob => {
        // You upload logic goes here
        const fileName = fileObject.file.name
          .substr(0, fileObject.file.name.lastIndexOf('.'))
          .toLowerCase()
        const newFile = new File([blob], `${fileName}.webp`, {
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
          disabled: fileObjects.length >= filesLimit,
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

Uploader.propTypes = {
  buttonText: PropTypes.string,
}

export { Uploader }
