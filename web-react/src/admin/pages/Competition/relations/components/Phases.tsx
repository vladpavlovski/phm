import React, { useCallback, useState, useMemo, useRef } from 'react'
import {
  gql,
  useLazyQuery,
  useMutation,
  MutationFunction,
} from '@apollo/client'

import { useSnackbar } from 'notistack'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, date } from 'yup'

import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import CreateIcon from '@mui/icons-material/Create'
import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import Autocomplete from '@mui/material/Autocomplete'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import LoadingButton from '@mui/lab/LoadingButton'
import MenuItem from '@mui/material/MenuItem'
import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { RHFDatepicker } from 'components/RHFDatepicker'
import { RHFInput } from 'components/RHFInput'
import { RHFSelect } from 'components/RHFSelect'

import { Error } from 'components/Error'
import { timeUnitStatusList } from 'components/lists'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, decomposeDate, formatDate } from 'utils'
import { Competition, Phase, Season } from 'utils/types'
const sortByName = (a: { name: string }, b: { name: string }) => {
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
    competitions(where: $where) {
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

const Phases: React.FC<TRelations> = props => {
  const { competitionId } = props
  const classes = useStyles()
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const deletedItemId = useRef(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])
  const [
    getData,
    {
      loading: queryLoading,
      error: queryError,
      data: { competitions: [competition] } = { competitions: [] },
    },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_PHASES, {
    variables: { where: { competitionId } },
    fetchPolicy: 'cache-and-network',
  })

  const openAccordion = useCallback(() => {
    if (!competition) {
      getData()
    }
  }, [competition])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteCompetitionPhase, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_COMPETITION_PHASE, {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PHASES,
            variables: {
              where: { competitionId },
            },
          })
          const updatedData = queryResult?.competitions?.[0]?.phases?.filter(
            p => p.phaseId !== deletedItemId.current
          )

          const updatedResult = {
            competitions: [
              {
                ...queryResult?.competitions?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
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
        deletedItemId.current = null
        enqueueSnackbar('Phase was deleted!')
      },
    })

  const competitionPhasesColumns = useMemo<GridColumns>(
    () => [
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
        <Error message={queryError?.message} />
        {competition && (
          <>
            <Toolbar disableGutters className={classes.toolbarForm}>
              <div />
              <div>
                <Button
                  onClick={() => {
                    handleOpenDialog(null)
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
              <DataGridPro
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
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        data={formData.current}
      />
    </Accordion>
  )
}

type TFormDialog = {
  competitionId: string
  competition: Competition
  openDialog: boolean
  handleCloseDialog: () => void
  data: Phase | null
}

const FormDialog: React.FC<TFormDialog> = React.memo(props => {
  const { competition, competitionId, openDialog, handleCloseDialog, data } =
    props
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>()
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
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_PHASES,
            variables: {
              where: { competitionId },
            },
          })
          const existingData = queryResult?.competitions?.[0]?.phases || []
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
            competitions: [
              {
                ...queryResult?.competitions?.[0],
                phases: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_PHASES,
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
        enqueueSnackbar('Competition phase created!', { variant: 'success' })
        handleCloseDialog()
        setSelectedSeason(undefined)
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate autoComplete="off">
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
                    <RHFSelect
                      fullWidth
                      control={control}
                      name="status"
                      label="Status"
                      defaultValue={data?.status || ''}
                      error={errors.status}
                    >
                      {timeUnitStatusList.map(s => {
                        return (
                          <MenuItem key={s.value} value={s.value}>
                            {s.name}
                          </MenuItem>
                        )
                      })}
                    </RHFSelect>
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
                        value={selectedSeason}
                        disableClearable
                        getOptionLabel={option => option.name}
                        isOptionEqualToValue={(option, value) =>
                          option?.seasonId === value?.seasonId
                        }
                        // getOptionSelected={(option, value) =>
                        //   option.seasonId === value.seasonId
                        // }
                        options={[...competition.seasons].sort(sortByName)}
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
})

export { Phases }
