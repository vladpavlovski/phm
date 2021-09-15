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
import Switch from '@mui/material/Switch'
import AccountBox from '@mui/icons-material/AccountBox'
import { getAdminOrgSponsorRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const REMOVE_AWARD_SPONSOR = gql`
  mutation removeAwardSponsor($awardId: ID!, $sponsorId: ID!) {
    awardSponsor: RemoveAwardSponsors(
      from: { awardId: $awardId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        awardId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

export const GET_ALL_SPONSORS = gql`
  query getSponsors {
    sponsors: Sponsor {
      sponsorId
      name
      awards {
        awardId
        name
      }
    }
  }
`

const MERGE_AWARD_SPONSOR = gql`
  mutation mergeAwardSponsor($awardId: ID!, $sponsorId: ID!) {
    awardSponsor: MergeAwardSponsors(
      from: { awardId: $awardId }
      to: { sponsorId: $sponsorId }
    ) {
      from {
        awardId
        name
      }
      to {
        sponsorId
        name
      }
    }
  }
`

const Sponsors = props => {
  const { awardId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_SPONSORS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { awardId } })
    }
  }, [])

  const awardSponsorsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Sponsor Name',
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
              sponsorId={params.row.sponsorId}
              awardId={awardId}
              sponsor={params.row}
            />
          )
        },
      },
      {
        field: 'sponsorId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgSponsorRoute(organizationSlug, params.value)}
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
        aria-controls="sponsors-content"
        id="sponsors-header"
      >
        <Typography className={classes.accordionFormTitle}>Sponsors</Typography>
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
                columns={awardSponsorsColumns}
                rows={setIdFromEntityId(queryData?.sponsors, 'sponsorId')}
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
  const { sponsorId, awardId, sponsor } = props
  const [isMember, setIsMember] = useState(
    !!sponsor?.awards?.find(p => p.awardId === awardId)
  )
  const { enqueueSnackbar } = useSnackbar()
  const [mergeAwardSponsor] = useMutation(MERGE_AWARD_SPONSOR, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardSponsor.to.name} add to ${data.awardSponsor.from.name} sponsor!`,
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

  const [removeAwardSponsor] = useMutation(REMOVE_AWARD_SPONSOR, {
    onCompleted: data => {
      enqueueSnackbar(
        `${data.awardSponsor.to.name} remove from ${data.awardSponsor.from.name} sponsor`,
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
          ? removeAwardSponsor({
              variables: {
                awardId,
                sponsorId,
              },
            })
          : mergeAwardSponsor({
              variables: {
                awardId,
                sponsorId,
              },
            })
        setIsMember(!isMember)
      }}
      name="sponsorMember"
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

Sponsors.propTypes = {
  awardId: PropTypes.string,
}

export { Sponsors }
