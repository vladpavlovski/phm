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
import { getAdminOrgTeamRoute } from 'router/routes'
import { Error, Loader, LinkButton } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'

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
  const classes = useStyles()

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
        <Typography className={classes.accordionFormTitle}>Teams</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600 }} className={classes.xGridDialog}>
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

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
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
})

export { Teams }
