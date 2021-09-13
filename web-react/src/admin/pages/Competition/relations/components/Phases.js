import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'
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
const sortByName = (a, b) => {
  if (a?.name < b?.name) {
    return 1
  }
  if (a?.name > b?.name) {
    return -1
  }
  return 0
}

const GET_PHASES = gql`
  query getCompetition($where: CompetitionWhere, $whereSeason: SeasonWhere) {
    competition: competitions(where: $where) {
      competitionId
      name
      phases {
        phaseId
        name
        nick
        short
        status
        startDate
        endDate
        season {
          seasonId
          name
        }
      }
    }
    seasons(where: $whereSeason) {
      seasonId
      name
    }
  }
`

const CREATE_COMPETITION_PHASE = gql`
  mutation createCompetitionPhase($input: [PhaseCreateInput!]!) {
    createPhases(input: $input) {
      phases {
        phaseId
        name
        nick
        short
        status
        startDate
        endDate
      }
    }
  }
`

const UPDATE_COMPETITION_PHASE = gql`
  mutation updateCompetitionPhase(
    $where: PhaseWhere
    $update: PhaseUpdateInput
  ) {
    updatePhases(where: $where, update: $update) {
      phases {
        phaseId
        name
        nick
        short
        status
        startDate
        endDate
      }
    }
  }
`

const DELETE_COMPETITION_PHASE = gql`
  mutation deletePhase($where: PhaseWhere) {
    deletePhases(where: $where) {
      nodesDeleted
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
  const deletedItemId = useRef()
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_PHASES, {
    variables: { where: { competitionId } },
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

  const [deleteCompetitionPhase, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_COMPETITION_PHASE, {
      update(cache) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              where: { competitionId },
              organizationSlug,
            },
          })
          const updatedData = queryResult?.competition?.[0]?.phases?.filter(
            p => p.phaseId !== deletedItemId.current
          )

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
            data: updatedResult,
            variables: {
              where: { competitionId },
              organizationSlug,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        deletedItemId.current = null
        enqueueSnackbar('Phase was deleted!')
      },
    })

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
              onDialogClosePositive={() => {
                deletedItemId.current = params.row.phaseId
                deleteCompetitionPhase({
                  variables: {
                    where: { phaseId: params.row.phaseId },
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
                  onClick={() => {
                    handleOpenDialog()
                  }}
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
                rows={setIdFromEntityId(competition?.phases, 'phaseId')}
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
        organizationSlug={organizationSlug}
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
    organizationSlug,
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

  const [createCompetitionPhase, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_COMPETITION_PHASE, {
      update(
        cache,
        {
          data: {
            createPhases: { phases },
          },
        }
      ) {
        try {
          const queryResult = cache.readQuery({
            query: GET_PHASES,
            variables: {
              where: { competitionId },
              organizationSlug,
            },
          })
          const existingData = queryResult?.competition?.[0]?.phases
          const newItem = phases?.[0]
          let updatedData = []
          if (existingData?.find(ed => ed.phaseId === newItem.phaseId)) {
            // replace if item exist in array
            updatedData = existingData?.map(ed =>
              ed.phaseId === newItem.phaseId ? newItem : ed
            )
          } else {
            // add new item if item not in array
            updatedData = [newItem, ...existingData]
          }

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
            data: updatedResult,
            variables: {
              where: { competitionId },
              organizationSlug,
            },
          })
        } catch (error) {
          console.error(error)
        }
      },
      onCompleted: () => {
        enqueueSnackbar('Competition phase created!', { variant: 'success' })
        handleCloseDialog()
        setSelectedSeason(null)
      },
    })

  const [updateCompetitionPhase, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_COMPETITION_PHASE, {
      onCompleted: () => {
        enqueueSnackbar('Competition phase updated!', { variant: 'success' })
      },
    })

  const handleSeasonChange = useCallback(
    selected => {
      updateCompetitionPhase({
        variables: {
          where: {
            phaseId: data?.phaseId,
          },
          update: {
            season: {
              connect: {
                where: {
                  node: { seasonId: selected?.seasonId || null },
                },
              },
              disconnect: {
                where: {
                  node: {
                    seasonId: selectedSeason?.seasonId || null,
                  },
                },
              },
            },
          },
        },
      })
    },
    [selectedSeason, data]
  )

  const onSubmit = useCallback(
    dataToCheck => {
      try {
        const { startDate, endDate, ...rest } = dataToCheck
        data?.phaseId
          ? updateCompetitionPhase({
              variables: {
                where: {
                  phaseId: data?.phaseId,
                },
                update: {
                  ...rest,
                  ...decomposeDate(startDate, 'startDate'),
                  ...decomposeDate(endDate, 'endDate'),
                },
              },
            })
          : createCompetitionPhase({
              variables: {
                input: {
                  ...rest,
                  ...decomposeDate(startDate, 'startDate'),
                  ...decomposeDate(endDate, 'endDate'),
                  competition: {
                    connect: {
                      where: {
                        node: { competitionId },
                      },
                    },
                  },
                },
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
                      autoFocus
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
                      defaultValue={data?.startDate}
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
                      defaultValue={data?.endDate}
                      error={errors?.endDate}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3} lg={3}>
                    {data?.phaseId && (
                      <Autocomplete
                        id="phase-season-select"
                        name="season"
                        value={selectedSeason}
                        disableClearable
                        getOptionLabel={option => option.name}
                        // isOptionEqualToValue={(option, value) =>
                        //   option?.seasonId === value?.seasonId
                        // }
                        getOptionSelected={(option, value) =>
                          option.seasonId === value.seasonId
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
          <LoadingButton
            type="submit"
            loading={mutationLoadingCreate || mutationLoadingUpdate}
          >
            {mutationLoadingCreate || mutationLoadingUpdate
              ? 'Saving...'
              : 'Save'}
          </LoadingButton>
        </DialogActions>
      </form>
    </Dialog>
  )
}

Phases.propTypes = {
  competitionId: PropTypes.string,
}

export { Phases }
