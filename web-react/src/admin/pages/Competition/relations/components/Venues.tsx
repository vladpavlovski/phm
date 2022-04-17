import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgVenueRoute } from 'router/routes'
import { setIdFromEntityId } from 'utils'
import { Competition } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { useStyles } from '../../../commonComponents/styled'

const GET_VENUES = gql`
  query getVenues($where: CompetitionWhere) {
    competitions(where: $where) {
      competitionId
      name
      venues {
        venueId
        name
        nick
        capacity
      }
    }
  }
`

export const GET_ALL_VENUES = gql`
  query getVenues {
    venues {
      venueId
      name
      nick
      capacity
    }
  }
`

type TRelations = {
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}

type TQueryTypeData = {
  competitions: Competition[]
}

type TQueryTypeVars = {
  where: {
    competitionId: string
  }
}

type TParams = { organizationSlug: string }

const Venues: React.FC<TRelations> = props => {
  const { competitionId, competition, updateCompetition } = props
  const classes = useStyles()
  const { organizationSlug } = useParams<TParams>()
  const [openAddVenue, setOpenAddVenue] = useState(false)

  const handleCloseAddVenue = useCallback(() => {
    setOpenAddVenue(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_VENUES)

  const [
    getAllVenues,
    {
      loading: queryAllVenuesLoading,
      error: queryAllVenuesError,
      data: queryAllVenues,
    },
  ] = useLazyQuery(GET_ALL_VENUES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { competitionId } } })
    }
  }, [])

  const handleOpenAddVenue = useCallback(() => {
    if (!queryAllVenues) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const competitionVenuesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },

      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 180,
        valueGetter: params => params.row?.capacity?.low || '',
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
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Detach',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Detach'}
              textLoading={'Detaching...'}
              dialogTitle={
                'Do you really want to detach competition from venue?'
              }
              dialogDescription={'You can add competition to venue later.'}
              dialogNegativeText={'No, keep in venue'}
              dialogPositiveText={'Yes, detach venue'}
              onDialogClosePositive={() => {
                updateCompetition({
                  variables: {
                    where: {
                      competitionId,
                    },
                    update: {
                      venues: {
                        disconnect: {
                          where: {
                            node: {
                              venueId: params.row.venueId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
  )

  const allVenuesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 100,
      },

      {
        field: 'capacity',
        headerName: 'Capacity',
        width: 180,
        valueGetter: params => params.row?.capacity?.low || '',
      },
      {
        field: 'venueId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return <ToggleNew {...props} venueId={params.value} />
        },
      },
    ],
    [competition]
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
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenAddVenue}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Venue
                </Button>

                <LinkButton
                  startIcon={<CreateIcon />}
                  to={getAdminOrgVenueRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={competitionVenuesColumns}
                rows={setIdFromEntityId(competition.venues, 'venueId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </>
        )}
      </AccordionDetails>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddVenue}
        onClose={handleCloseAddVenue}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllVenuesLoading && <Loader />}
        <Error message={queryAllVenuesError?.message} />
        {competition && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${competition?.name} to new venue`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <DataGridPro
                  columns={allVenuesColumns}
                  rows={setIdFromEntityId(queryAllVenues?.venues, 'venueId')}
                  disableSelectionOnClick
                  loading={queryAllVenuesLoading}
                  components={{
                    Toolbar: GridToolbar,
                  }}
                />
              </div>
            </DialogContent>
          </>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              handleCloseAddVenue()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

type TToggleNew = {
  venueId: string
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { venueId, competitionId, competition, updateCompetition } = props

  const [isMember, setIsMember] = useState(
    !!competition.venues.find(p => p.venueId === venueId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? updateCompetition({
              variables: {
                where: {
                  competitionId,
                },
                update: {
                  venues: {
                    disconnect: {
                      where: {
                        node: {
                          venueId,
                        },
                      },
                    },
                  },
                },
              },
            })
          : updateCompetition({
              variables: {
                where: {
                  competitionId,
                },
                update: {
                  venues: {
                    connect: {
                      where: {
                        node: { venueId },
                      },
                    },
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
