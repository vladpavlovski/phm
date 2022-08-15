import { ButtonDelete } from 'admin/pages/commonComponents/ButtonDelete'
import { RHFInput } from 'components'
import React from 'react'
import Img from 'react-cool-img'
import { useForm } from 'react-hook-form'
import { useUserInfo } from 'utils/hooks'
import { Media } from 'utils/types'
import { object, string } from 'yup'
import { gql, useMutation } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import EditIcon from '@mui/icons-material/Edit'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import ImageListItem from '@mui/material/ImageListItem'
import ImageListItemBar from '@mui/material/ImageListItemBar'
// import Paper from '@mui/material/Paper'
import Zoom from '@mui/material/Zoom'
import { GET_MEDIA } from '../index'

const UPDATE_FILE = gql`
  mutation updateFile($where: FileWhere, $update: FileUpdateInput) {
    updateFiles(where: $where, update: $update) {
      files {
        fileId
        name
        description
        type
        url
      }
    }
  }
`

const DELETE_FILE = gql`
  mutation deleteFile($where: FileWhere) {
    deleteFiles(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  description: string(),
})

type Props = {
  mediaId: string
  item: {
    fileId: string
    src: string
    description: string
    name: string
  }
  onImageClick: () => void
}

type TQueryTypeData = {
  media: Media[]
}

type TQueryTypeVars = {
  where: {
    mediaId: string
  }
}

const MediaImage = (props: Props) => {
  const { item, onImageClick, mediaId } = props

  const { canEdit } = useUserInfo()

  const [checked, setChecked] = React.useState(false)

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  const [updateFile] = useMutation(UPDATE_FILE, {
    update(cache, { data }) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_MEDIA,
          variables: {
            where: { mediaId },
          },
        })

        const fileToUpdate = data.updateFiles.files?.[0]
        cache.writeQuery({
          query: GET_MEDIA,
          data: {
            media: [
              {
                ...queryResult?.media?.[0],
                files: queryResult?.media?.[0]?.files?.map(f =>
                  f.fileId === fileToUpdate.fileId ? fileToUpdate : f
                ),
              },
            ],
          },
          variables: { where: { mediaId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
  })

  const [deleteFile] = useMutation(DELETE_FILE, {
    variables: { where: { fileId: item.fileId } },
    update(cache) {
      try {
        const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
          query: GET_MEDIA,
          variables: {
            where: { mediaId },
          },
        })

        cache.writeQuery({
          query: GET_MEDIA,
          data: {
            media: [
              {
                ...queryResult?.media?.[0],
                files: queryResult?.media?.[0]?.files?.filter(
                  f => f.fileId !== item.fileId
                ),
              },
            ],
          },
          variables: { where: { mediaId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
  })

  const onSubmit = React.useCallback(
    dataToCheck => {
      updateFile({
        variables: {
          where: {
            fileId: item.fileId,
          },
          update: dataToCheck,
        },
      })
    },
    [item]
  )

  return (
    <ClickAwayListener
      onClickAway={() => {
        setChecked(false)
      }}
    >
      <ImageListItem>
        <Img
          lazy
          width={'100%'}
          // className={classes.imageHover}
          src={`${item.src}`}
          srcSet={`${item.src}`}
          alt={item.name}
          onClick={onImageClick}
        />
        <ImageListItemBar
          title={item.name}
          subtitle={item.description}
          actionIcon={
            <IconButton
              sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
              aria-label={`info about ${item.name}`}
              onClick={() => {
                setChecked(s => !s)
              }}
            >
              <EditIcon />
            </IconButton>
          }
        />

        <Zoom in={checked}>
          <Card
            variant="outlined"
            sx={{
              m: 1,
              position: 'absolute',
              width: 'calc(100% - 16px)',
              height: 'calc(100% - 16px)',
            }}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              autoComplete="off"
              style={{
                display: 'flex',
                height: '100%',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <CardContent>
                <Container maxWidth={false}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <RHFInput
                        defaultValue={item?.name}
                        control={control}
                        name="name"
                        label="Name"
                        required
                        fullWidth
                        variant="standard"
                        error={errors.name}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <RHFInput
                        defaultValue={item?.description}
                        control={control}
                        name="description"
                        label="Description"
                        fullWidth
                        variant="standard"
                        error={errors?.description}
                      />
                    </Grid>
                  </Grid>
                </Container>
              </CardContent>
              <CardActions sx={{ display: 'flex', justifyContent: 'end' }}>
                {canEdit && (
                  <ButtonDelete
                    size="small"
                    color="error"
                    onClick={() => {
                      deleteFile()
                    }}
                  />
                )}
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  color="secondary"
                  onClick={() => {
                    setChecked(false)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="outlined"
                  type="submit"
                  size="small"
                  color="primary"
                  onClick={() => {
                    setChecked(false)
                  }}
                >
                  Save
                </Button>
              </CardActions>
            </form>
          </Card>
        </Zoom>
      </ImageListItem>
    </ClickAwayListener>
  )
}

export { MediaImage }
