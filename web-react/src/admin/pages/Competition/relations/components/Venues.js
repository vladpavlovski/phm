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
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import AccountBox from '@material-ui/icons/AccountBox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgVenueRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_VENUES = gql`
  query getVenues($where: CompetitionWhere) {
    competition: competitions(where: $where) {
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

const UPDATE_VENUE = gql`
  mutation updateVenue($where: VenueWhere, $update: VenueUpdateInput) {
    updateVenues(where: $where, update: $update) {
      venues {
        venueId
        name
        nick
        capacity
        competitions {
          competitionId
          name
        }
      }
    }
  }
`

// const REMOVE_TEAM_VENUE = gql`
//   mutation removeCompetitionVenue($competitionId: ID!, $venueId: ID!) {
//     competitionVenue: RemoveCompetitionVenues(
//       from: { competitionId: $competitionId }
//       to: { venueId: $venueId }
//     ) {
//       from {
//         competitionId
//       }
//       to {
//         venueId
//         name
//       }
//     }
//   }
// `

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

// const MERGE_TEAM_VENUE = gql`
//   mutation mergeCompetitionVenue($competitionId: ID!, $venueId: ID!) {
//     competitionVenue: MergeCompetitionVenues(
//       from: { competitionId: $competitionId }
//       to: { venueId: $venueId }
//     ) {
//       from {
//         competitionId
//       }
//       to {
//         venueId
//         name
//         nick
//         capacity
//       }
//     }
//   }
// `

const Venues = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddVenue, setOpenAddVenue] = useState(false)
  const updateStatus = React.useRef()

  const handleCloseAddVenue = useCallback(() => {
    setOpenAddVenue(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_VENUES)

  const [
    getAllVenues,
    {
      loading: queryAllVenuesLoading,
      error: queryAllVenuesError,
      data: queryAllVenuesData,
    },
  ] = useLazyQuery(GET_ALL_VENUES)

  // const [mergeCompetitionVenue] = useMutation(MERGE_TEAM_VENUE, {
  //   update(cache, { data: { competitionVenue } }) {
  //     try {
  //       const queryResult = cache.readQuery({
  //         query: GET_VENUES,
  //         variables: {
  //           competitionId,
  //         },
  //       })

  //       const existingVenues = queryResult.competition[0].venues
  //       const newVenue = competitionVenue.to
  //       const updatedResult = {
  //         competition: [
  //           {
  //             ...queryResult.competition[0],
  //             venues: [newVenue, ...existingVenues],
  //           },
  //         ],
  //       }
  //       cache.writeQuery({
  //         query: GET_VENUES,
  //         data: updatedResult,
  //         variables: {
  //           competitionId,
  //         },
  //       })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onCompleted: data => {
  //     enqueueSnackbar(
  //       `${competition.name} add to ${data.competitionVenue.to.name} venue!`,
  //       {
  //         variant: 'success',
  //       }
  //     )
  //   },
  //   onError: error => {
  //     enqueueSnackbar(`Error happened :( ${error}`, {
  //       variant: 'error',
  //     })
  //     console.error(error)
  //   },
  // })

  const competition = queryData?.competition?.[0]

  const [updateVenue, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_VENUE,
    {
      update(
        cache,
        {
          data: {
            updateVenues: { venues },
          },
        }
      ) {
        try {
          const queryResult = cache.readQuery({
            query: GET_VENUES,
            variables: {
              where: { competitionId },
            },
          })

          const updatedData =
            updateStatus.current === 'disconnect'
              ? queryResult?.competition?.[0]?.venues?.filter(
                  p => p.venueId !== venues?.[0]?.venueId
                )
              : [...queryResult?.competition?.[0]?.venues, ...venues]

          const updatedResult = {
            competition: [
              {
                ...queryResult?.competition?.[0],
                venues: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_VENUES,
            data: updatedResult,
            variables: {
              where: { competitionId },
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        // getData()
        updateStatus.current = null
        enqueueSnackbar('Season updated!', { variant: 'success' })
      },
    }
  )

  // const [
  //   removeCompetitionVenue,
  //   { loading: mutationLoadingRemove },
  // ] = useMutation(REMOVE_TEAM_VENUE, {
  //   update(cache, { data: { competitionVenue } }) {
  //     try {
  //       const queryResult = cache.readQuery({
  //         query: GET_VENUES,
  //         variables: {
  //           competitionId,
  //         },
  //       })

  //       const updatedVenues = queryResult.competition[0].venues.filter(
  //         p => p.venueId !== competitionVenue.to.venueId
  //       )

  //       const updatedResult = {
  //         competition: [
  //           {
  //             ...queryResult.competition[0],
  //             venues: updatedVenues,
  //           },
  //         ],
  //       }
  //       cache.writeQuery({
  //         query: GET_VENUES,
  //         data: updatedResult,
  //         variables: {
  //           competitionId,
  //         },
  //       })
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   },
  //   onCompleted: data => {
  //     enqueueSnackbar(
  //       `${competition.name} remove from ${data.competitionVenue.to.name} venue`,
  //       {
  //         variant: 'info',
  //       }
  //     )
  //   },
  //   onError: error => {
  //     enqueueSnackbar(`Error happened :( ${error}`, {
  //       variant: 'error',
  //     })
  //   },
  // })

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { competitionId } } })
    }
  }, [])

  const handleOpenAddVenue = useCallback(() => {
    if (!queryAllVenuesData) {
      getAllVenues()
    }
    setOpenAddVenue(true)
  }, [])

  const competitionVenuesColumns = useMemo(
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
              loading={mutationLoadingUpdate}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach competition from venue?'
              }
              dialogDescription={'You can add competition to venue later.'}
              dialogNegativeText={'No, keep in venue'}
              dialogPositiveText={'Yes, detach venue'}
              onDialogClosePositive={() => {
                updateStatus.current = 'disconnect'
                updateVenue({
                  variables: {
                    where: {
                      venueId: params.row?.venueId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
                // removeCompetitionVenue({
                //   variables: {
                //     competitionId,
                //     venueId: params.row.venueId,
                //   },
                // })
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
  )

  const allVenuesColumns = useMemo(
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
          return (
            <ToggleNewVenue
              venueId={params.value}
              competitionId={competitionId}
              competition={competition}
              update={updateVenue}
              updateStatus={updateStatus}
              // merge={mergeCompetitionVenue}
              // remove={removeCompetitionVenue}
            />
          )
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
              <XGrid
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
        {queryAllVenuesLoading && !queryAllVenuesError && <Loader />}
        {queryAllVenuesError && !queryAllVenuesLoading && (
          <Error message={queryAllVenuesError.message} />
        )}
        {queryAllVenuesData && !queryAllVenuesLoading && !queryAllVenuesError && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add ${
              competition && competition.name
            } to new venue`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600 }} className={classes.xGridDialog}>
                <XGrid
                  columns={allVenuesColumns}
                  rows={setIdFromEntityId(queryAllVenuesData.venues, 'venueId')}
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

const ToggleNewVenue = props => {
  const { venueId, competitionId, competition, update, updateStatus } = props
  const [isMember, setIsMember] = useState(
    !!competition.venues.find(p => p.venueId === venueId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? update({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      competitions: {
                        disconnect: {
                          where: {
                            node: {
                              competitionId,
                            },
                          },
                        },
                      },
                    },
                  },
                })
              : update({
                  variables: {
                    where: {
                      venueId,
                    },
                    update: {
                      competitions: {
                        connect: {
                          where: {
                            node: { competitionId },
                          },
                        },
                      },
                    },
                  },
                })
            updateStatus.current = isMember ? 'disconnect' : null

            setIsMember(!isMember)
          }}
          name="venueMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewVenue.propTypes = {
  playerId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  update: PropTypes.func,
}

Venues.propTypes = {
  competitionId: PropTypes.string,
}

export { Venues }
