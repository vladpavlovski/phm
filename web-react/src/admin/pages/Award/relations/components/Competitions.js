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
import { getAdminOrgCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_COMPETITION = gql`
  mutation removeAwardCompetition($awardId: ID!, $competitionId: ID!) {
    awardCompetition: RemoveAwardCompetitions(
      from: { awardId: $awardId }
      to: { competitionId: $competitionId }
    ) {
      from {
        awardId
        name
      }
      to {
        competitionId
        name
      }
    }
  }
`

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions: Competition {
      competitionId
      name
      nick
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_COMPETITION = gql`
  mutation mergeAwardCompetition($awardId: ID!, $competitionId: ID!) {
    awardCompetition: MergeAwardCompetitions(
      from: { awardId: $awardId }
      to: { competitionId: $competitionId }
    ) {
      from {
        awardId
        name
      }
      to {
        competitionId
        name
      }
    }
  }
`

const Competitions = props => {
  const { awardId } = props

  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_COMPETITIONS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardCompetitionsColumns = useMemo(
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
              competitionId={params.row.competitionId}
              awardId={awardId}
              competition={params.row}
            />
          )
        },
      },

      {
        field: 'competitionId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgCompetitionRoute(organizationSlug, params.value)}
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
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
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
                columns={awardCompetitionsColumns}
                rows={setIdFromEntityId(
                  queryData?.competitions,
                  'competitionId'
                )}
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
  const { competitionId, awardId, competition } = props
  const [isMember, setIsMember] = useState(
    !!competition?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardCompetition] = useMutation(MERGE_AWARD_COMPETITION, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardCompetition.to.name} add to ${data.awardCompetition.from.name} competition!`,
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

  const [removeAwardCompetition] = useMutation(REMOVE_AWARD_COMPETITION, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardCompetition.to.name} remove from ${data.awardCompetition.from.name} competition`,
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
      label={isMember ? 'Award' : 'Not award'}
      checked={isMember}
      onChange={() => {
        isMember
          ? removeAwardCompetition({
              variables: {
                awardId,
                competitionId,
              },
            })
          : mergeAwardCompetition({
              variables: {
                awardId,
                competitionId,
              },
            })
        setIsMember(!isMember)
      }}
      name="competitionMember"
      color="primary"
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

Competitions.propTypes = {
  awardId: PropTypes.string,
}

export { Competitions }
