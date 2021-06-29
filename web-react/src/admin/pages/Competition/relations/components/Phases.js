import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, date } from 'yup'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import EditIcon from '@material-ui/icons/Edit'
import CreateIcon from '@material-ui/icons/Create'
import Toolbar from '@material-ui/core/Toolbar'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Button from '@material-ui/core/Button'
import Autocomplete from '@material-ui/core/Autocomplete'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { RHFDatepicker } from '../../../../../components/RHFDatepicker'
import { RHFInput } from '../../../../../components/RHFInput'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import {
  setIdFromEntityId,
  decomposeDate,
  formatDate,
} from '../../../../../utils'

const GET_PHASES = gql`
  query getCompetition($competitionId: ID, $organizationSlug: String!) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      phases {
        phaseId
        name
        nick
        short
        status
        startDate {
          formatted
        }
        endDate {
          formatted
        }
        season {
          seasonId
          name
        }
      }
    }
    seasons: seasonsByOrganization(organizationSlug: $organizationSlug) {
      seasonId
      name
    }
  }
`

const MERGE_COMPETITION_PHASE = gql`
  mutation mergeCompetitionPhase(
    $competitionId: ID!
    $phaseId: ID!
    $name: String
    $nick: String
    $short: String
    $status: String
    $startDateDay: Int
    $startDateMonth: Int
    $startDateYear: Int
    $endDateDay: Int
    $endDateMonth: Int
    $endDateYear: Int
  ) {
    phase: MergePhase(
      phaseId: $phaseId
      name: $name
      nick: $nick
      short: $short
      status: $status
      startDate: {
        day: $startDateDay
        month: $startDateMonth
        year: $startDateYear
      }
      endDate: { day: $endDateDay, month: $endDateMonth, year: $endDateYear }
    ) {
      phaseId
      name
    }
    phaseCompetition: MergePhaseCompetition(
      from: { competitionId: $competitionId }
      to: { phaseId: $phaseId }
    ) {
      from {
        name
      }
      to {
        phaseId
        name
        nick
        short
        status
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

const DELETE_PHASE = gql`
  mutation deletePhase($phaseId: ID!) {
    deleted: DeletePhase(phaseId: $phaseId) {
      phaseId
    }
  }
`

const MERGE_PHASE_SEASON = gql`
  mutation mergePhaseSeason($phaseId: ID!, $seasonId: ID!) {
    mergePhaseSeason: MergePhaseSeason(
      from: { phaseId: $phaseId }
      to: { seasonId: $seasonId }
    ) {
      from {
        phaseId
      }
      to {
        seasonId
        name
      }
    }
  }
`
const REMOVE_MERGE_PHASE_SEASON = gql`
  mutation removeMergePhaseSeason(
    $phaseId: ID!
    $seasonIdToRemove: ID!
    $seasonIdToMerge: ID!
  ) {
    removePhaseSeason: RemovePhaseSeason(
      from: { phaseId: $phaseId }
      to: { seasonId: $seasonIdToRemove }
    ) {
      from {
        phaseId
      }
      to {
        seasonId
        name
      }
    }
    mergePhaseSeason: MergePhaseSeason(
      from: { phaseId: $phaseId }
      to: { seasonId: $seasonIdToMerge }
    ) {
      from {
        phaseId
      }
      to {
        seasonId
        name
      }
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  status: string(),
  startDate: date().nullable(),
  endDate: date().nullable(),
})

const Phases = props => {
  const { competitionId } = props
  const { organizationSlug } = useParams()
  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PHASES, {
    variables: { competitionId, organizationSlug },
    fetchPolicy: 'cache-and-network',
  })

  const competition = queryData?.competition?.[0]

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deletePhase, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_PHASE,
    {
      update(cache, { data: { deleted } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              competitionId,
            },
          })
          const updatedData = queryResult.competition[0].phases.filter(
            p => p.phaseId !== deleted.phaseId
          )

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
            data: updatedResult,
            variables: {
              competitionId,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar(`Phase was deleted!`, {
          variant: 'info',
        })
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const competitionPhasesColumns = useMemo(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },

      {
        field: 'nick',
        headerName: 'Nick',
        width: 120,
      },
      {
        field: 'short',
        headerName: 'Short',
        width: 120,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 120,
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
        field: 'season',
        headerName: 'Season',
        width: 150,
        valueGetter: params => params.row?.season?.name,
      },
      {
        field: 'phaseId',
        headerName: 'Edit',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <Button
              onClick={() => handleOpenDialog(params.row)}
              variant={'outlined'}
              size="small"
              className={classes.submit}
              startIcon={<EditIcon />}
            >
              Edit
            </Button>
          )
        },
      },
      {
        field: 'removeButton',
        headerName: 'Delete',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ButtonDialog
              text={'Delete'}
              textLoading={'Deleting...'}
              loading={mutationLoadingRemove}
              size="small"
              startIcon={<DeleteForeverIcon />}
              dialogTitle={'Do you really want to delete this phase?'}
              dialogDescription={'Phase will be completely delete'}
              dialogNegativeText={'No, keep phase'}
              dialogPositiveText={'Yes, delete phase'}
              onDialogClosePositive={() =>
                deletePhase({
                  variables: {
                    phaseId: params.row.phaseId,
                  },
                })
              }
            />
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
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography className={classes.accordionFormTitle}>Phases</Typography>
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
                  onClick={handleOpenDialog}
                  variant={'outlined'}
                  size="small"
                  className={classes.submit}
                  startIcon={<CreateIcon />}
                >
                  Create
                </Button>
              </div>
            </Toolbar>
            <div style={{ height: 600 }} className={classes.xGridDialog}>
              <XGrid
                columns={competitionPhasesColumns}
                rows={setIdFromEntityId(competition.phases, 'phaseId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
                }}
                sortModel={[
                  {
                    field: 'startDate',
                    sort: 'desc',
                  },
                ]}
              />
            </div>
          </>
        )}
      </AccordionDetails>

      <FormDialog
        competition={competition}
        competitionId={competitionId}
        seasons={queryData?.seasons}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

const FormDialog = props => {
  const {
    competition,
    competitionId,
    seasons,
    openDialog,
    handleCloseDialog,
    data,
  } = props
  const [selectedSeason, setSelectedSeason] = useState()
  const classes = useStyles()
  const { enqueueSnackbar } = useSnackbar()

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

  React.useEffect(() => {
    if (data?.season) {
      setSelectedSeason(data?.season)
    }
  }, [data])

  const [mergeCompetitionPhase, { loading: loadingMergePhase }] = useMutation(
    MERGE_COMPETITION_PHASE,
    {
      update(cache, { data: { phaseCompetition } }) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              competitionId,
            },
          })

          const existingData = queryResult?.competition?.[0]?.phases
          const newItem = phaseCompetition?.to
          let updatedData = []
          if (existingData.find(ed => ed.phaseId === newItem.phaseId)) {
            // replace if item exist in array
            updatedData = existingData.map(ed =>
              ed.phaseId === newItem.phaseId ? newItem : ed
            )
          } else {
            // add new item if item not in array
            updatedData = [newItem, ...existingData]
          }

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
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
          `${data.phaseCompetition.to.name} added to ${competition.name}!`,
          {
            variant: 'success',
          }
        )
        handleCloseDialog()
        setSelectedSeason(null)
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const [removeMergePhaseSeason] = useMutation(REMOVE_MERGE_PHASE_SEASON, {
    onCompleted: data => {
      setSelectedSeason(data?.mergePhaseSeason?.to)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const [mergePhaseSeason] = useMutation(MERGE_PHASE_SEASON, {
    onCompleted: data => {
      setSelectedSeason(data?.mergePhaseSeason?.to)
    },
    onError: error => {
      enqueueSnackbar(`Error happened :( ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const handleSeasonChange = useCallback(
    selected => {
      if (selectedSeason && selectedSeason?.seasonId !== selected?.seasonId) {
        removeMergePhaseSeason({
          variables: {
            phaseId: data?.phaseId,
            seasonIdToRemove: selectedSeason.seasonId,
            seasonIdToMerge: selected.seasonId,
          },
        })
      } else {
        mergePhaseSeason({
          variables: {
            phaseId: data?.phaseId,
            seasonIdToMerge: selected.seasonId,
          },
        })
      }
    },
    [selectedSeason, data]
  )

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, ...rest } = dataToCheck

        mergeCompetitionPhase({
          variables: {
            ...rest,
            ...decomposeDate(startDate, 'startDate'),
            ...decomposeDate(endDate, 'endDate'),
            competitionId,
            phaseId: data?.phaseId || uuidv4(),
          },
        })
      } catch (error) {
        console.error(error)
      }
    },
    [competitionId, data]
  )

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={openDialog}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={classes.form}
        noValidate
        autoComplete="off"
      >
        <DialogTitle id="alert-dialog-title">{`${
          data?.phaseId ? 'Edit phase in' : 'Add new phase to'
        } ${competition?.name}`}</DialogTitle>
        <DialogContent>
          <Container>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={6} lg={6}>
                    <RHFInput
                      control={control}
                      defaultValue={data?.name || ''}
                      name="name"
                      label="Name"
                      required
                      fullWidth
                      variant="standard"
                      error={errors?.name}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.nick}
                      control={control}
                      name="nick"
                      label="Nick"
                      fullWidth
                      variant="standard"
                      error={errors?.nick}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.short}
                      control={control}
                      name="short"
                      label="Short"
                      fullWidth
                      variant="standard"
                      error={errors?.short}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFInput
                      defaultValue={data?.status}
                      control={control}
                      name="status"
                      label="Status"
                      fullWidth
                      variant="standard"
                      error={errors?.status}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFDatepicker
                      fullWidth
                      control={control}
                      variant="standard"
                      name="startDate"
                      label="Start Date"
                      id="startDate"
                      openTo="year"
                      inputFormat={'DD/MM/YYYY'}
                      views={['year', 'month', 'day']}
                      defaultValue={data?.startDate?.formatted}
                      error={errors?.startDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    <RHFDatepicker
                      fullWidth
                      control={control}
                      variant="standard"
                      name="endDate"
                      label="End Date"
                      id="endDate"
                      openTo="year"
                      inputFormat={'DD/MM/YYYY'}
                      views={['year', 'month', 'day']}
                      defaultValue={data?.endDate?.formatted}
                      error={errors?.endDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    {data && (
                      <Autocomplete
                        id="phase-season-select"
                        name="season"
                        value={selectedSeason}
                        disableClearable
                        getOptionLabel={option => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option?.seasonId === value?.seasonId
                        }
                        options={[...seasons].sort(sortByName)}
                        onChange={(_, data) => {
                          handleSeasonChange(data)
                        }}
                        renderOption={(props, option) => (
                          <li {...props} key={option?.seasonId}>
                            {option?.name}
                          </li>
                        )}
                        renderInput={params => (
                          <TextField
                            {...params}
                            fullWidth
                            label="Season"
                            variant="standard"
                            inputProps={{
                              ...params.inputProps,
                              autoComplete: 'off',
                            }}
                          />
                        )}
                      />
                    )}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Container>
        </DialogContent>

        <DialogActions>
          <Button type="button" onClick={handleCloseDialog}>
            {'Cancel'}
          </Button>
          <LoadingButton type="submit" loading={loadingMergePhase}>
            {loadingMergePhase ? 'Saving...' : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

const sortByName = (a, b) => {
  if (a?.name < b?.name) {
    return 1
  }
  if (a?.name > b?.name) {
    return -1
  }
  return 0
}

Phases.propTypes = {
  competitionId: PropTypes.string,
}

export { Phases }
