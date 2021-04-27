import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

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
import { getAdminSeasonRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { formatDate, setIdFromEntityId } from '../../../../../utils'

const GET_SEASONS = gql`
  query getSeasons($competitionId: ID) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      seasons {
        seasonId
        name
        nick
        startDate {
          formatted
        }
        endDate {
          formatted
        }
      }
    }
  }
`

const REMOVE_TEAM_SEASON = gql`
  mutation removeCompetitionSeason($competitionId: ID!, $seasonId: ID!) {
    competitionSeason: RemoveCompetitionSeasons(
      from: { competitionId: $competitionId }
      to: { seasonId: $seasonId }
    ) {
      from {
        competitionId
      }
      to {
        seasonId
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
    }
  }
`

const MERGE_TEAM_SEASON = gql`
  mutation mergeCompetitionSeason($competitionId: ID!, $seasonId: ID!) {
    competitionSeason: MergeCompetitionSeasons(
      from: { competitionId: $competitionId }
      to: { seasonId: $seasonId }
    ) {
      from {
        competitionId
      }
      to {
        seasonId
        name
        nick
        startDate {
          formatted
        }
        endDate {
          formatted
        }
      }
    }
  }
`

const Seasons = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSeason, setOpenAddSeason] = useState(false)

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

  const [mergeCompetitionSeason] = useMutation(MERGE_TEAM_SEASON, {
    update(cache, { data: { competitionSeason } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SEASONS,
          variables: {
            competitionId,
          },
        })

        const existingSeasons = queryResult.competition[0].seasons
        const newSeason = competitionSeason.to
        const updatedResult = {
          competition: [
            {
              ...queryResult.competition[0],
              seasons: [newSeason, ...existingSeasons],
            },
          ],
        }
        cache.writeQuery({
          query: GET_SEASONS,
          data: updatedResult,
          variables: {
            competitionId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${competition.name} add to ${data.competitionSeason.to.name} season!`,
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

  const competition =
    queryData && queryData.competition && queryData.competition[0]

  const [
    removeCompetitionSeason,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_TEAM_SEASON, {
    update(cache, { data: { competitionSeason } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_SEASONS,
          variables: {
            competitionId,
          },
        })

        const updatedSeasons = queryResult.competition[0].seasons.filter(
          p => p.seasonId !== competitionSeason.to.seasonId
        )

        const updatedResult = {
          competition: [
            {
              ...queryResult.competition[0],
              seasons: updatedSeasons,
            },
          ],
        }
        cache.writeQuery({
          query: GET_SEASONS,
          data: updatedResult,
          variables: {
            competitionId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${competition.name} remove from ${data.competitionSeason.to.name} season`,
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

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
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
              to={getAdminSeasonRoute(params.value)}
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
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach competition from season?'
              }
              dialogDescription={'You can add competition to season later.'}
              dialogNegativeText={'No, keep in season'}
              dialogPositiveText={'Yes, detach season'}
              onDialogClosePositive={() => {
                removeCompetitionSeason({
                  variables: {
                    competitionId,
                    seasonId: params.row.seasonId,
                  },
                })
              }}
            />
          )
        },
      },
    ],
    []
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
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewSeason
              seasonId={params.value}
              competitionId={competitionId}
              competition={competition}
              merge={mergeCompetitionSeason}
              remove={removeCompetitionSeason}
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
                  to={getAdminSeasonRoute('new')}
                >
                  Create
                </LinkButton>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
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
                  <XGrid
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
  const { seasonId, competitionId, competition, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!competition.seasons.find(p => p.seasonId === seasonId)
  )

  return (
    <FormControlLabel
      control={
        <Switch
          checked={isMember}
          onChange={() => {
            isMember
              ? remove({
                  variables: {
                    competitionId,
                    seasonId,
                  },
                })
              : merge({
                  variables: {
                    competitionId,
                    seasonId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="seasonMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not member'}
    />
  )
}

ToggleNewSeason.propTypes = {
  playerId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  remove: PropTypes.func,
  merge: PropTypes.func,
}

Seasons.propTypes = {
  competitionId: PropTypes.string,
}

export { Seasons }
