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
import { getAdminOrgVenueRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_VENUE = gql`
  mutation removeAwardVenue($awardId: ID!, $venueId: ID!) {
    awardVenue: RemoveAwardVenue(
      from: { venueId: $venueId }
      to: { awardId: $awardId }
    ) {
      from {
        venueId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

export const GET_ALL_VENUES = gql`
  query getVenues {
    venues: Venue {
      venueId
      name
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_VENUE = gql`
  mutation mergeAwardVenue($awardId: ID!, $venueId: ID!) {
    awardVenue: MergeAwardVenue(
      from: { venueId: $venueId }
      to: { awardId: $awardId }
    ) {
      from {
        venueId
        name
      }
      to {
        awardId
        name
      }
    }
  }
`

const Venues = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_VENUES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardVenuesColumns = useMemo(
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
              venueId={params.row.venueId}
              awardId={awardId}
              venue={params.row}
            />
          )
        },
      },

      {
        field: 'venueId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgVenueRoute(organizationSlug, params.value)}
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
        aria-controls="venues-content"
        id="venues-header"
      >
        <Typography className={classes.accordionFormTitle}>Venues</Typography>
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
                columns={awardVenuesColumns}
                rows={setIdFromEntityId(queryData?.venues, 'venueId')}
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
  const { venueId, awardId, venue } = props
  const [isMember, setIsMember] = useState(
    !!venue?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardVenue] = useMutation(MERGE_AWARD_VENUE, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardVenue.to.name} add to ${data.awardVenue.from.name} venue!`,
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

  const [removeAwardVenue] = useMutation(REMOVE_AWARD_VENUE, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardVenue.to.name} remove from ${data.awardVenue.from.name} venue`,
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
          ? removeAwardVenue({
              variables: {
                awardId,
                venueId,
              },
            })
          : mergeAwardVenue({
              variables: {
                awardId,
                venueId,
              },
            })
        setIsMember(!isMember)
      }}
      name="venueMember"
      color="primary"
      label={isMember ? 'Award' : 'Not award'}
    />
  )
}

ToggleAward.propTypes = {
  venueId: PropTypes.string,
  awardId: PropTypes.string,
  award: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Venues.propTypes = {
  awardId: PropTypes.string,
}

export { Venues }
