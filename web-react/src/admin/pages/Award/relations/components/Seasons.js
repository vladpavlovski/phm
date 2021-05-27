import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'
import { getAdminOrgSeasonRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { formatDate, setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_SEASON = gql`
  mutation removeAwardSeason($awardId: ID!, $seasonId: ID!) {
    awardSeason: RemoveAwardSeasons(
      from: { seasonId: $seasonId }
      to: { awardId: $awardId }
    ) {
      from {
        seasonId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_SEASONS = gql`
  query getSeasons {
    seasons: Season {
      seasonId
      name
      nick
      startDate {
        formatted
      }
      endDate {
        formatted
      }
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_SEASON = gql`
  mutation mergeAwardSeason($awardId: ID!, $seasonId: ID!) {
    awardSeason: MergeAwardSeasons(
      from: { seasonId: $seasonId }
      to: { awardId: $awardId }
    ) {
      from {
        seasonId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Seasons = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_SEASONS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardSeasonsColumns = useMemo(
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
              seasonId={params.row.seasonId}
              awardId={awardId}
              season={params.row}
            />
          )
        },
      },

      {
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params.row.startDate.formatted,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate.formatted,
        valueFormatter: params => formatDate(params.value),
      },

      {
        field: 'seasonId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgSeasonRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
    ],
    [organizationSlug]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="seasons-content"
        id="seasons-header"
      >
        <Typography className={classes.accordionFormTitle}>Seasons</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            {/* {place for toolbar} */}
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                disableMultipleSelection
                disableSelectionOnClick
                columns={awardSeasonsColumns}
                rows={setIdFromEntityId(queryData?.seasons, 'seasonId')}
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
  const { seasonId, awardId, season } = props
  const [isMember, setIsMember] = useState(
    !!season?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardSeason] = useMutation(MERGE_AWARD_SEASON, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardSeason.to.name} add to ${data.awardSeason.from.name} season!`,
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

  const [removeAwardSeason] = useMutation(REMOVE_AWARD_SEASON, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardSeason.to.name} remove from ${data.awardSeason.from.name} season`,
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
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? removeAwardSeason({
                  variables: {
                    awardId,
                    seasonId,
                  },
                })
              : mergeAwardSeason({
                  variables: {
                    awardId,
                    seasonId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="seasonMember"
          color="primary"
        />
      }
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

Seasons.propTypes = {
  awardId: PropTypes.string,
}

export { Seasons }
