import { Error, LinkButton, Loader } from 'components'
import React from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgSeasonRoute } from 'router/routes'
import { formatDate, setIdFromEntityId } from 'utils'
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

export const GET_ALL_SEASONS = gql`
  query getSeasons($where: SeasonWhere) {
    seasons(where: $where) {
      seasonId
      name
      nick
      startDate
      endDate
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

const Seasons: React.FC<TRelations> = props => {
  const { awardId, award, updateAward } = props
  const { organizationSlug } = useParams<TParams>()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_SEASONS)

  const openAccordion = React.useCallback(() => {
    if (!queryData) {
      getData({
        variables: { where: { org: { urlSlug: organizationSlug } } },
      })
    }
  }, [])

  const awardSeasonsColumns = React.useMemo<GridColumns>(
    () => [
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
      {
        field: 'name',
        headerName: 'Name',
        width: 250,
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
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },

      {
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params.row.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row.endDate,
        valueFormatter: params => formatDate(params.value),
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
        <Typography>Seasons</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
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
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TToggleNew = {
  seasonId: string
  awardId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleAward: React.FC<TToggleNew> = props => {
  const { seasonId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = React.useState(
    !!award?.seasons?.find(p => p.seasonId === seasonId)
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
              seasons: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            seasonId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { seasonId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="seasonMember"
      color="primary"
    />
  )
}

export { Seasons }
