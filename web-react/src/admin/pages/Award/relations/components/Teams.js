import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { getAdminOrgTeamRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_TEAM = gql`
  mutation removeAwardTeam($awardId: ID!, $teamId: ID!) {
    awardTeam: RemoveAwardTeams(
      from: { teamId: $teamId }
      to: { awardId: $awardId }
    ) {
      from {
        teamId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_TEAMS = gql`
  query getTeams {
    teams: Team {
      teamId
      name
      nick
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_TEAM = gql`
  mutation mergeAwardTeam($awardId: ID!, $teamId: ID!) {
    awardTeam: MergeAwardTeams(
      from: { teamId: $teamId }
      to: { awardId: $awardId }
    ) {
      from {
        teamId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Teams = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_TEAMS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardTeamsColumns = useMemo(
    () => [
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
            <ToggleAward
              teamId={params.row.teamId}
              awardId={awardId}
              team={params.row}
            />
          )
        },
      },

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
    ],
    []
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
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
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
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

const ToggleAward = props => {
  const { teamId, awardId, team } = props
  const [isMember, setIsMember] = useState(
    !!team?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardTeam] = useMutation(MERGE_AWARD_TEAM, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardTeam.to.name} add to ${data.awardTeam.from.name} team!`,
        {
          variant: 'success',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [removeAwardTeam] = useMutation(REMOVE_AWARD_TEAM, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardTeam.to.name} remove from ${data.awardTeam.from.name} team`,
        {
          variant: 'info',
        }
      )
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
    },
  })

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? removeAwardTeam({
              variables: {
                awardId,
                teamId,
              },
            })
          : mergeAwardTeam({
              variables: {
                awardId,
                teamId,
              },
            })
        setIsMember(!isMember)
      }}
      name="teamMember"
      color="primary"
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  playerId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Teams.propTypes = {
  awardId: PropTypes.string,
}

export { Teams }
