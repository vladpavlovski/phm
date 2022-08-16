import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgTeamRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

export const GET_ALL_TEAMS = gql`
  query getTeams($where: TeamWhere) {
    teams(where: $where) {
      teamId
      name
      nick
      status
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

const Teams: React.FC<TRelations> = props => {
  const { awardId, award, updateAward } = props
  const { organizationSlug } = useParams<TParams>()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_TEAMS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { orgs: { urlSlug: organizationSlug } } } })
    }
  }, [])

  const awardTeamsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'teamId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgTeamRoute(organizationSlug, params.value)}
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
        field: 'status',
        headerName: 'Status',
        width: 100,
      },

      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              teamId={params.row.teamId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },
    ],
    [award]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="teams-content"
        id="teams-header"
      >
        <Typography>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardTeamsColumns}
              rows={setIdFromEntityId(queryData?.teams, 'teamId')}
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
  teamId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = props => {
  const { teamId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = useState(
    !!award?.teams?.find(p => p.teamId === teamId)
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
              teams: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            teamId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { teamId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
    />
  )
}

export { Teams }
