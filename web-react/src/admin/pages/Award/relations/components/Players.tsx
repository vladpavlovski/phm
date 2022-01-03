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
import { getAdminOrgPlayerRoute } from 'router/routes'

import { Error, Loader, LinkButton } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, getXGridValueFromArray } from 'utils'
import { Award } from 'utils/types'

export const GET_ALL_PLAYERS = gql`
  query getPlayers($where: PlayerWhere) {
    players(where: $where) {
      playerId
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
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

const Players: React.FC<TRelations> = props => {
  const { awardId, updateAward, award } = props
  const { organizationSlug } = useParams<TParams>()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PLAYERS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({
        variables: {
          where: { teams: { orgs: { urlSlug: organizationSlug } } },
        },
      })
    }
  }, [])

  const awardPlayersColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'playerId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPlayerRoute(organizationSlug, params.value)}
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
        field: 'teamName',
        headerName: 'Team Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.teams, 'name')
        },
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              playerId={params.row.playerId}
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
        aria-controls="players-content"
        id="players-header"
      >
        <Typography className={classes.accordionFormTitle}>Players</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600 }} className={classes.xGridDialog}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardPlayersColumns}
              rows={setIdFromEntityId(queryData?.players, 'playerId')}
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
  playerId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { playerId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = useState(
    !!award?.players?.find(p => p.playerId === playerId)
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
              players: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            playerId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { playerId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="playerMember"
      color="primary"
    />
  )
})

export { Players }
