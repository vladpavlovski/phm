import { GET_COMPETITION } from 'admin/pages/Competition'
import { QuickSearchToolbar, RHFDatepicker, RHFInput, RHFSelect } from 'components'
import { timeUnitStatusList } from 'components/lists'
import { useSnackbar } from 'notistack'
import React, { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { decomposeDate, formatDate, setIdFromEntityId } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Competition, Phase, Season } from 'utils/types'
import { date, object, string } from 'yup'
import { gql, MutationFunction, useMutation } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import CreateIcon from '@mui/icons-material/Create'
import EditIcon from '@mui/icons-material/Edit'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import LoadingButton from '@mui/lab/LoadingButton'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridRowsProp } from '@mui/x-data-grid-pro'
import { ButtonDialog } from '../../../commonComponents/ButtonDialog'

const sortByName = (a: { name: string }, b: { name: string }) => {
  if (a?.name < b?.name) {
    return 1
  }
  if (a?.name > b?.name) {
    return -1
  }
  return 0
}

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
        season {
          seasonId
          name
        }
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
        season {
          seasonId
          name
        }
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
  status: string().required('Status is required'),
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
  const { competitionId, competition } = props
  const [openDialog, setOpenDialog] = useState(false)
  const formData = useRef(null)
  const deletedItemId = useRef(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleCloseDialog = useCallback(() => {
    setOpenDialog(false)

    formData.current = null
  }, [])

  const handleOpenDialog = useCallback(data => {
    formData.current = data
    setOpenDialog(true)
  }, [])

  const [deleteCompetitionPhase, { loading: mutationLoadingRemove }] =
    useMutation(DELETE_COMPETITION_PHASE, {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_COMPETITION,
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
            query: GET_COMPETITION,
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

  const competitionPhasesColumns: GridColumns = [
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
  ]

  const searchIndexes = [
    'name',
    'nick',
    'short',
    'status',
    'startDate',
    'endDate',
  ]

  const queryData: GridRowsProp[] = React.useMemo(
    () => setIdFromEntityId(competition?.phases || [], 'phaseId'),
    [competition]
  )

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: queryData,
  })

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <>
          <Toolbar
            disableGutters
            sx={{ p: 0, display: 'flex', justifyContent: 'space-between' }}
          >
            <div />
            <div>
              <Button
                onClick={() => {
                  handleOpenDialog(null)
                }}
                variant={'outlined'}
                size="small"
                startIcon={<CreateIcon />}
              >
                Create
              </Button>
            </div>
          </Toolbar>
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              columns={competitionPhasesColumns}
              rows={searchData}
              components={{
                Toolbar: QuickSearchToolbar,
              }}
              componentsProps={{
                toolbar: {
                  value: searchText,
                  onChange: (
                    event: React.ChangeEvent<HTMLInputElement>
                  ): void => requestSearch(event.target.value),
                  clearSearch: () => requestSearch(''),
                },
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

const FormDialog: React.FC<TFormDialog> = props => {
  const { competition, competitionId, openDialog, handleCloseDialog, data } =
    props
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
    data?.season
  )

  const { handleSubmit, control, errors } = useForm({
    resolver: yupResolver(schema),
  })

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
            query: GET_COMPETITION,
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
            query: GET_COMPETITION,
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
        handleCloseDialog()
        setSelectedSeason(undefined)
      },
    })

  const [updateCompetitionPhase, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_COMPETITION_PHASE, {
      onCompleted: () => {
        handleCloseDialog()
        setSelectedSeason(undefined)
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
                      required
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
                        options={[...(competition?.seasons || [])].sort(
                          sortByName
                        )}
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

export { Phases }
