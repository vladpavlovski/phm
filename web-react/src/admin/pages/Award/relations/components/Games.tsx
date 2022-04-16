import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, MutationFunction } from '@apollo/client'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { getAdminOrgGameRoute } from 'router/routes'

import { Error, Loader, LinkButton } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'

export const GET_ALL_GAMES = gql`
  query getGames($where: GameWhere) {
    games(where: $where) {
      gameId
      name
    }
  }
`

type TRelations = {
  awardId: string
  award: Award
  updateAward: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Games: React.FC<TRelations> = props => {
  const { awardId, award, updateAward } = props
  const { organizationSlug } = useParams<TParams>()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_GAMES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { org: { urlSlug: organizationSlug } } } })
    }
  }, [])

  const awardGamesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'gameId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgGameRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              gameId={params.row.gameId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },
    ],
    [organizationSlug, award]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="games-content"
        id="games-header"
      >
        <Typography className={classes.accordionFormTitle}>Games</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardGamesColumns}
              rows={setIdFromEntityId(queryData?.games, 'gameId')}
              loading={queryLoading}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TToggleNew = {
  awardId: string
  gameId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { gameId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = useState(
    !!award?.games?.find(p => p.gameId === gameId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateAward({
          variables: {
            where: {
              awardId,
            },
            update: {
              games: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            gameId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { gameId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="gameMember"
      color="primary"
    />
  )
})

export { Games }
