import { useSnackbar } from 'notistack'
import React from 'react'
import { gql, useMutation } from '@apollo/client'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const CREATE_MEDIA = gql`
  mutation createMedia($input: [MediaCreateInput!]!) {
    createMedia(input: $input) {
      media {
        mediaId
      }
    }
  }
`

type Props = {
  parentId: string
  parentType: string
  setWorkingMediaId: React.Dispatch<React.SetStateAction<string | undefined>>
}

const CreateMedia = (props: Props) => {
  const { parentId, parentType, setWorkingMediaId } = props

  const { enqueueSnackbar } = useSnackbar()
  const [createMedia] = useMutation(CREATE_MEDIA, {
    variables: {
      input: {
        [parentType]: {
          connect: {
            where: {
              node: {
                [`${parentType}Id`]: parentId,
              },
            },
          },
        },
      },
    },
    onCompleted: data => {
      const newId = data?.createMedia?.media?.[0]?.mediaId
      setWorkingMediaId(newId)

      enqueueSnackbar('Media Created 📸', { variant: 'success' })
    },
    onError: error => {
      enqueueSnackbar(`${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <Card sx={{ minWidth: 275 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          No Media 😭
        </Typography>

        <Typography variant="body2" color="text.secondary">
          No media were found for this entity. We will happy to create new one
          in just one click 😉
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          onClick={() => {
            createMedia()
          }}
        >
          Create Media
        </Button>
      </CardActions>
    </Card>
  )
}

export { CreateMedia }
