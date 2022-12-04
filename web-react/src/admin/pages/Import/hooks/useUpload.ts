import { IMPORT_TYPE } from 'admin/pages/Import'
import { CREATE_PLAYER } from 'admin/pages/Import/queries'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { useParams } from 'react-router'
import { getAdminOrgPlayerRoute } from 'router/routes'
import { ParamsProps } from 'utils/types'
import { ApolloError, useMutation } from '@apollo/client'

const getEntityLink = (
  entity: any,
  importType: IMPORT_TYPE,
  organizationSlug: string
) => {
  switch (importType) {
    case IMPORT_TYPE.player:
      return getAdminOrgPlayerRoute(organizationSlug, entity.playerId)
    default:
      return ''
  }
}

export const useUpload = ({
  importType,
  data,
}: {
  importType: IMPORT_TYPE
  data: { [key: string]: string }
}): {
  uploadItem: () => void
  entityLink: string
  loading: boolean
  error?: ApolloError
} => {
  const { enqueueSnackbar } = useSnackbar()
  const { organizationSlug } = useParams<ParamsProps>()
  const [entityLink, setEntityLink] = useState<string>('')
  const [createPlayer, { loading, error }] = useMutation(CREATE_PLAYER, {
    onCompleted: data => {
      const { players } = data.createPlayers
      if (players?.[0]) {
        const player = players[0]
        const link = getEntityLink(player, importType, organizationSlug)
        setEntityLink(link)
      }
      enqueueSnackbar('Player saved!', { variant: 'success' })
    },
    onError: error => {
      console.log(`Error: ${error}`)
    },
  })

  const uploadPlayer = () => {
    const {
      teamName,
      teamId,
      positionName,
      positionId,
      jerseyNumber,
      ...playerData
    } = data

    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    const notUsed = { teamName, positionName }

    createPlayer({
      variables: {
        input: {
          ...playerData,
          meta: {
            create: {
              node: {},
            },
          },
          ...(teamId && {
            teams: {
              connect: {
                where: {
                  node: {
                    teamId,
                  },
                },
              },
            },
          }),
          ...(positionId && {
            positions: {
              connect: {
                where: {
                  node: {
                    positionId,
                  },
                },
              },
            },
          }),
          ...(jerseyNumber && {
            jerseys: {
              connect: {
                where: {
                  node: {
                    number: parseInt(jerseyNumber, 10) || 99,
                    team: {
                      teamId,
                    },
                  },
                },
              },
            },
          }),
        },
      },
    })
  }

  switch (importType) {
    case IMPORT_TYPE.player:
      return { uploadItem: uploadPlayer, entityLink, loading, error }
    case IMPORT_TYPE.game:
      break
  }

  return { uploadItem: () => {}, entityLink, loading, error }
}
