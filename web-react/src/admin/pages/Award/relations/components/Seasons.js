import React from 'react'
import { gql, useLazyQuery } from '@apollo/client'
import PropTypes from 'prop-types'
// import { useSnackbar } from 'notistack'
import { useParams } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import AccountBox from '@mui/icons-material/AccountBox'
import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'
import { getAdminOrgSeasonRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { formatDate, setIdFromEntityId } from '../../../../../utils'

export const GET_ALL_SEASONS = gql`
  query getSeasons {
    seasons {
      seasonId
      name
      nick
      startDate
      endDate
      awards {
        awardId
        name
      }
    }
  }
`

const Seasons = props => {
  const { awardId, award, updateAward } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_SEASONS)

  const openAccordion = React.useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const awardSeasonsColumns = React.useMemo(
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
          <div style={{ height: 600 }} className={classes.xGridDialog}>
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

const ToggleAward = props => {
  const { seasonId, awardId, season, updateAward } = props
  const [isMember, setIsMember] = React.useState(
    !!season?.awards?.find(p => p.awardId === awardId)
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
