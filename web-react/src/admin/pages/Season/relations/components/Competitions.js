import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import AccountBox from '@material-ui/icons/AccountBox'
import AddIcon from '@material-ui/icons/Add'

import Toolbar from '@material-ui/core/Toolbar'
import LinkOffIcon from '@material-ui/icons/LinkOff'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { getAdminCompetitionRoute } from '../../../../../routes'
import { LinkButton } from '../../../../../components/LinkButton'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from '../../../../../utils'

const GET_COMPETITIONS = gql`
  query getSeasonCompetitions($seasonId: ID) {
    season: Season(seasonId: $seasonId) {
      seasonId
      name
      competitions {
        competitionId
        name
      }
    }
  }
`

const REMOVE_SEASON_COMPETITION = gql`
  mutation removeSeasonCompetition($seasonId: ID!, $competitionId: ID!) {
    seasonCompetition: RemoveSeasonCompetitions(
      from: { competitionId: $competitionId }
      to: { seasonId: $seasonId }
    ) {
      from {
        competitionId
        name
      }
      to {
        seasonId
        name
      }
    }
  }
`

export const GET_ALL_COMPETITIONS = gql`
  query getCompetitions {
    competitions: Competition {
      competitionId
      name
    }
  }
`

const MERGE_SEASON_COMPETITION = gql`
  mutation mergeSeasonCompetitions($seasonId: ID!, $competitionId: ID!) {
    seasonCompetition: MergeSeasonCompetitions(
      from: { competitionId: $competitionId }
      to: { seasonId: $seasonId }
    ) {
      from {
        competitionId
        name
      }
      to {
        seasonId
        name
      }
    }
  }
`

const Competitions = props => {
  const { seasonId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  const [openAddSeason, setOpenAddSeason] = useState(false)

  const handleCloseAddSeason = useCallback(() => {
    setOpenAddSeason(false)
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const season = queryData?.season?.[0]

  const [
    getAllSeasons,
    {
      loading: queryAllSeasonsLoading,
      error: queryAllSeasonsError,
      data: queryAllSeasonsData,
    },
  ] = useLazyQuery(GET_ALL_COMPETITIONS, {
    fetchPolicy: 'cache-and-network',
  })

  const [
    removeCompetitionSeason,
    { loading: mutationLoadingRemove },
  ] = useMutation(REMOVE_SEASON_COMPETITION, {
    update(cache, { data: { seasonCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            seasonId,
          },
        })
        const updatedData = queryResult?.season?.[0]?.competitions.filter(
          p => p.competitionId !== seasonCompetition.from.competitionId
        )

        const updatedResult = {
          season: [
            {
              ...queryResult?.season?.[0],
              competitions: updatedData,
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
          data: updatedResult,
          variables: {
            seasonId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.seasonCompetition.from.name} not owned by ${season.name}!`,
        {
          variant: 'info',
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

  const [mergeCompetitionSeason] = useMutation(MERGE_SEASON_COMPETITION, {
    update(cache, { data: { seasonCompetition } }) {
      try {
        const queryResult = cache.readQuery({
          query: GET_COMPETITIONS,
          variables: {
            seasonId,
          },
        })
        const existingData = queryResult?.season?.[0]?.competitions
        const newItem = seasonCompetition.from
        const updatedResult = {
          season: [
            {
              ...queryResult?.season?.[0],
              competitions: [newItem, ...existingData],
            },
          ],
        }
        cache.writeQuery({
          query: GET_COMPETITIONS,
          data: updatedResult,
          variables: {
            seasonId,
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    onCompleted: data => {
      enqueueSnackbar(
        `${data.seasonCompetition.from.name} owned by ${season.name}!`,
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

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { seasonId } })
    }
  }, [])

  const handleOpenAddSeason = useCallback(() => {
    if (!queryAllSeasonsData) {
      getAllSeasons()
    }
    setOpenAddSeason(true)
  }, [])

  const seasonCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'competitionId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminCompetitionRoute(params.value)}
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Remove',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Remove'}
              textLoading={'Removing...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<LinkOffIcon />}
              dialogTitle={
                'Do you really want to detach competition from season?'
              }
              dialogDescription={
                'Competition will remain in the database. You can add him to any season later.'
              }
              dialogNegativeText={'No, keep competition'}
              dialogPositiveText={'Yes, detach competition'}
              onDialogClosePositive={() => {
                removeCompetitionSeason({
                  variables: {
                    seasonId,
                    competitionId: params.row.competitionId,
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

  const allCompetitionsColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 300,
      },

      {
        field: 'competitionId',
        headerName: 'Membership',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNewCompetition
              competitionId={params.value}
              seasonId={seasonId}
              season={season}
              merge={mergeCompetitionSeason}
              remove={removeCompetitionSeason}
            />
          )
        },
      },
    ],
    [season]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="competitions-content"
        id="competitions-header"
      >
        <Typography className={classes.accordionFormTitle}>
          Competitions
        </Typography>
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
                  Add Competition
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={seasonCompetitionsColumns}
                rows={setIdFromEntityId(season.competitions, 'competitionId')}
                loading={queryAllSeasonsLoading}
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
              <DialogTitle id="alert-dialog-title">{`Add ${season?.name} to new competition`}</DialogTitle>
              <DialogContent>
                <div style={{ height: 600 }} className={classes.xGridDialog}>
                  <XGrid
                    columns={allCompetitionsColumns}
                    rows={setIdFromEntityId(
                      queryAllSeasonsData.competitions,
                      'competitionId'
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

const ToggleNewCompetition = props => {
  const { seasonId, competitionId, season, remove, merge } = props
  const [isMember, setIsMember] = useState(
    !!season.competitions.find(p => p.competitionId === competitionId)
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
                    seasonId,
                    competitionId,
                  },
                })
              : merge({
                  variables: {
                    seasonId,
                    competitionId,
                  },
                })
            setIsMember(!isMember)
          }}
          name="competitionMember"
          color="primary"
        />
      }
      label={isMember ? 'Member' : 'Not Member'}
    />
  )
}

ToggleNewCompetition.propTypes = {
  seasonId: PropTypes.string,
  competitionId: PropTypes.string,
  competition: PropTypes.object,
  removeCompetitionSeason: PropTypes.func,
  mergeCompetitionSeason: PropTypes.func,
  loading: PropTypes.bool,
}

Competitions.propTypes = {
  seasonId: PropTypes.string,
}

export { Competitions }
