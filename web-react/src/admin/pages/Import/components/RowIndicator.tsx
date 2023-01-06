import { IMPORT_TYPE } from 'admin/pages/Import'
import { useUpload } from 'admin/pages/Import/hooks/useUpload'
import { LinkButton } from 'components/LinkButton'
import React, { useState } from 'react'
import { RowIndicatorProps } from 'react-spreadsheet'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { Button, CircularProgress, Stack, Typography } from '@mui/material'

export const RowIndicator = ({
  row,
  data,
  importType,
}: RowIndicatorProps & {
  data: { [key: string]: string }
  importType: IMPORT_TYPE
}) => {
  const [saved, setSaved] = useState(false)

  const { uploadItem, entityLink, loading } = useUpload({
    importType,
    data,
  })
  const linkToNewEntity = () => {
    if (entityLink) {
      return (
        <LinkButton
          to={entityLink}
          startIcon={<OpenInNewIcon />}
          type="button"
          size="small"
          target="_blank"
        >
          Open
        </LinkButton>
      )
    }
    return null
  }
  //TODO: better check if data is valid
  return (
    <Stack component="td">
      {!data?.lastName ? (
        <Typography></Typography>
      ) : (
        <>
          <Button
            disabled={saved}
            startIcon={
              loading ? (
                <CircularProgress size="16px" />
              ) : saved ? (
                <DoneAllIcon />
              ) : (
                <CloudUploadIcon />
              )
            }
            onClick={() => {
              setSaved(true)
              uploadItem()
            }}
            type="button"
            size="small"
          >
            {saved ? 'Saved' : `Save ${row + 1}`}
          </Button>
          {linkToNewEntity()}
        </>
      )}
    </Stack>
  )
}
