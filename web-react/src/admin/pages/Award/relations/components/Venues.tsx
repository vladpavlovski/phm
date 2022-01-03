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
import { getAdminOrgVenueRoute } from 'router/routes'

import { Error, Loader, LinkButton } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'

export const GET_ALL_VENUES = gql`
  query getVenues($where: VenueWhere) {
    venues(where: $where) {
      venueId
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

const Venues: React.FC<TRelations> = props => {
  const { awardId, updateAward, award } = props
  const { organizationSlug } = useParams<TParams>()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_VENUES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const awardVenuesColumns = useMemo<GridColumns>(
    () => [
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
              venueId={params.row.venueId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
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
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
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
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TToggleNew = {
  awardId: string
  venueId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { venueId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = useState(
    !!award?.venues?.find(p => p.venueId === venueId)
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
              venues: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            venueId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { venueId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="venueMember"
      color="primary"
    />
  )
})

export { Venues }
