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
import AddIcon from '@mui/icons-material/Add'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import LinkOffIcon from '@mui/icons-material/LinkOff'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import AccountBox from '@mui/icons-material/AccountBox'

import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminOrgSeasonRoute } from '../../../../../router/routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { formatDate, setIdFromEntityId } from '../../../../../utils'

const GET_SEASONS = gql`
  query getSeasons($where: CompetitionWhere) {
    competition: competitions(where: $where) {
      competitionId
      name
      seasons {
        seasonId
        name
        nick
        startDate
        endDate
      }
    }
  }
`

const UPDATE_SEASON = gql`
  mutation updateSeason($where: SeasonWhere, $update: SeasonUpdateInput) {
    updateSeasons(where: $where, update: $update) {
      seasons {
        seasonId
        name
        nick
        startDate
        endDate
        competitions {
          competitionId
          name
        }
      }
    }
  }
`

export const GET_ALL_SEASONS = gql`
  query getSeasons {
    seasons {
      seasonId
      name
      nick
      startDate
      endDate
    }
  }
`

const Seasons = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const { organizationSlug } = useParams()
  const [openAddSeason, setOpenAddSeason] = useState(false)
  const updateStatus = React.useRef()

  const handleCloseAddSeason = useCallback(() => {
    setOpenAddSeason(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_SEASONS)

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_SEASONS)

  const [updateSeason, { loading: mutationLoadingUpdate }] = useMutation(
    UPDATE_SEASON,
    {
      update(
        cache,
        {
          data: {
            updateSeasons: { seasons },
          },
        }
      ) {
        try {
          const queryResult = cache.readQuery({
            query: GET_SEASONS,
            variables: {
              where: { competitionId },
            },
          })

          const updatedData =
            updateStatus.current === 'disconnect'
              ? queryResult?.competition?.[0]?.seasons?.filter(
                  p => p.seasonId !== seasons?.[0]?.seasonId
                )
              : [...queryResult?.competition?.[0]?.seasons, ...seasons]

          const updatedResult = {
            competition: [
              {
                ...queryResult?.competition?.[0],
                seasons: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_SEASONS,
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

  const competition = queryData?.competition?.[0] || {}

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { competitionId } } })
    }
  }, [])

  const handleOpenAddSeason = useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const competitionSeasonsColumns = useMemo(
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
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params.row?.startDate,
        valueFormatter: params => formatDate(params.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row?.endDate,
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
                'Do you really want to detach competition from season?'
              }
              dialogDescription={'You can add competition to season later.'}
              dialogNegativeText={'No, keep in season'}
              dialogPositiveText={'Yes, detach season'}
              onDialogClosePositive={() => {
                updateStatus.current = 'disconnect'
                updateSeason({
                  variables: {
                    where: {
                      seasonId: params.row?.seasonId,
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
              }}
            />
          )
        },
      },
    ],
    [organizationSlug]
  )

  const allSeasonsColumns = useMemo(
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
        field: 'startDate',
        headerName: 'Start Date',
        width: 180,
        valueGetter: params => params.row?.startDate,
        valueFormatter: params => formatDate(params?.value),
      },
      {
        field: 'endDate',
        headerName: 'End Date',
        width: 180,
        valueGetter: params => params.row?.endDate,
        valueFormatter: params => formatDate(params?.value),
      },
      {
        field: 'seasonId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSeason
              seasonId={params.value}
              competitionId={competitionId}
              competition={competition}
              update={updateSeason}
              updateStatus={updateStatus}
            />
          )
        },
      },
    ],
    [competition, competitionId]
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
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={handleOpenAddSeason}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<AddIcon />}
                >
                  Add Season
                </Button>

                <LinkButton
                  startIcon={<CreateIcon />}
                  to={getAdminOrgSeasonRoute(organizationSlug, 'new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <DataGridPro
                columns={competitionSeasonsColumns}
                rows={setIdFromEntityId(competition.seasons, 'seasonId')}
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
        open={openAddSeason}
        onClose={handleCloseAddSeason}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllSeasonsLoading && !queryAllSeasonsError && <Loader />}
        {queryAllSeasonsError && !queryAllSeasonsLoading && (
          <Error message={queryAllSeasonsError.message} />
        )}
        {queryAllSeasonsData &&
          !queryAllSeasonsLoading &&
          !queryAllSeasonsError && (
            <>
              <DialogTitle id="alert-dialog-title">{`Add ${
                competition && competition.name
              } to new season`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <DataGridPro
                    columns={allSeasonsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.seasons,
                      'seasonId'
                    )}
                    disableSelectionOnClick
                    loading={queryAllSeasonsLoading}
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
              handleCloseAddSeason()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </Accordion>
  )
}

const ToggleNewSeason = props => {
  const { seasonId, competitionId, competition, update, updateStatus } = props
  const [isMember, setIsMember] = useState(
    !!competition?.seasons?.find(p => p.seasonId === seasonId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        isMember
          ? update({
              variables: {
                where: {
                  seasonId,
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
                  seasonId,
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
      name="seasonMember"
      color="primary"
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewSeason.propTypes = {
  playerId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  update: PropTypes.func,
}

Seasons.propTypes = {
  competitionId: PropTypes.string,
}

export { Seasons }
