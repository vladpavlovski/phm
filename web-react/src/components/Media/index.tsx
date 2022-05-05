import { Uploader } from 'components'
import { MediaImage } from 'components/Media/components/MediaImage'
import React from 'react'
import ReactViewer from 'react-viewer'
import { File as FileType, Media as MediaType } from 'utils/types'
import { gql, useMutation, useQuery } from '@apollo/client'
import ImageList from '@mui/material/ImageList'
import { CreateMedia } from './components/CreateMedia'

export const GET_MEDIA = gql`
  query getMedia($where: MediaWhere) {
    media(where: $where) {
      mediaId
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

const UPDATE_MEDIA = gql`
  mutation updateMedia($where: MediaWhere, $update: MediaUpdateInput) {
    updateMedia(where: $where, update: $update) {
      media {
        mediaId
        files {
          fileId
          name
          description
          type
          url
        }
      }
    }
  }
`

type TMedia = {
  mediaId?: string
  parentId: string
  parentType: string
  folderName: string
}

const transformImageData = (mediaData: MediaType) =>
  mediaData?.files?.map((file: FileType) => ({ ...file, src: file.url })) || []

// TODO: upload audio/video entities
const Media: React.FC<TMedia> = props => {
  const { folderName, mediaId, parentId, parentType } = props

  const [activeIndex, setActiveIndex] = React.useState(0)
  const [isOpenImageViewer, setIsOpenImageViewer] = React.useState(false)
  const [workingMediaId, setWorkingMediaId] = React.useState(mediaId)

  const {
    data: { media: [mediaData] } = {
      media: [],
    },
    // error: mediaError,
  } = useQuery(GET_MEDIA, {
    variables: {
      where: {
        mediaId,
      },
    },
    skip: !mediaId,
  })

  const [
    updateMedia,
    // { loading: mutationLoadingMerge, error: mutationErrorMerge },
  ] = useMutation(UPDATE_MEDIA, {
    update(cache, { data }) {
      try {
        cache.writeQuery({
          query: GET_MEDIA,
          data: {
            media: data?.updateMedia?.media,
          },
          variables: { where: { mediaId: workingMediaId } },
        })
      } catch (error) {
        console.error(error)
      }
    },
  })

  const updateMediaOnSubmit = React.useCallback(
    (url, fileName) => {
      updateMedia({
        variables: {
          where: {
            mediaId: workingMediaId,
          },
          update: {
            files: {
              create: {
                node: {
                  name:
                    fileName ||
                    `Attachment ${(mediaData?.files?.length || 0) + 1}`,
                  type: 'image',
                  description: '',
                  url,
                },
              },
            },
          },
        },
      })
    },
    [workingMediaId, mediaData?.files]
  )

  // create new media, if not exist
  if (!workingMediaId) {
    return (
      <CreateMedia
        parentId={parentId}
        parentType={parentType}
        setWorkingMediaId={setWorkingMediaId}
      />
    )
  }

  // TODO: bulk upload images

  return (
    <>
      <Uploader
        buttonText={'Add Image'}
        onSubmit={updateMediaOnSubmit}
        folderName={folderName}
      />
      <ImageList sx={{ width: '100%' }} cols={3}>
        {transformImageData(mediaData).map((item, index) => (
          <MediaImage
            key={item.src}
            item={item}
            mediaId={workingMediaId}
            onImageClick={() => {
              setActiveIndex(index)
              setIsOpenImageViewer(true)
            }}
          />
        ))}
      </ImageList>

      {isOpenImageViewer && (
        <ReactViewer
          zIndex={5000}
          visible={isOpenImageViewer}
          onClose={() => {
            setActiveIndex(0)
            setIsOpenImageViewer(false)
          }}
          images={transformImageData(mediaData)}
          activeIndex={activeIndex}
        />
      )}
    </>
  )
}

export { Media }
