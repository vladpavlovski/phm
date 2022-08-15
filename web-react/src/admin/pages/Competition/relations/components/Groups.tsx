import { Error, QuickSearchToolbar, RHFInput, RHFSelect } from 'components'
import { timeUnitStatusList } from 'components/lists'
import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { setIdFromEntityId } from 'utils'
import { useXGridSearch } from 'utils/hooks'
import { Competition, Group, Season } from 'utils/types'
import { number, object, string } from 'yup'
import { gql, MutationFunction, useLazyQuery, useMutation } from '@apollo/client'
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

const GET_GROUPS = gql`
  query getCompetition($where: CompetitionWhere) {
    competitions(where: $where) {
      competitionId
      name
      groups {
        groupId
        name
        nick
        short
        status
        teamsLimit
        season {
          seasonId
          name
        }
      }
      seasons {
        seasonId
        name
      }
    }
  }
`

const CREATE_COMPETITION_GROUP = gql`
  mutation createCompetitionGroup($input: [GroupCreateInput!]!) {
    createGroups(input: $input) {
      groups {
        groupId
        name
        nick
        short
        status
        teamsLimit
        season {
          seasonId
          name
        }
      }
    }
  }
`

const UPDATE_COMPETITION_GROUP = gql`
  mutation updateCompetitionGroup(
    $where: GroupWhere
    $update: GroupUpdateInput
  ) {
    updateGroups(where: $where, update: $update) {
      groups {
        groupId
        name
        nick
        short
        status
        teamsLimit
        season {
          seasonId
          name
        }
      }
    }
  }
`

const DELETE_COMPETITION_GROUP = gql`
  mutation deleteGroup($where: GroupWhere) {
    deleteGroups(where: $where) {
      nodesDeleted
    }
  }
`

const schema = object().shape({
  name: string().required('Name is required'),
  nick: string(),
  short: string(),
  status: string(),
  teamsLimit: number().integer().positive().required('Teams limit is required'),
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

const Groups: React.FC<TRelations> = props => {
  const { competitionId } = props
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
    {
      loading: queryLoading,
      error: queryError,
      data: { competitions: [competition] } = { competitions: [] },
    },
  ] = useLazyQuery<TQueryTypeData, TQueryTypeVars>(GET_GROUPS, {
    variables: { where: { competitionId } },
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

  const [deleteGroup, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_COMPETITION_GROUP,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GROUPS,
            variables: {
              where: { competitionId },
            },
          })
          const updatedData = queryResult?.competitions?.[0]?.groups?.filter(
            p => p.groupId !== deletedItemId.current
          )

          const updatedResult = {
            competitions: [
              {
                ...queryResult?.competitions?.[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
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
        enqueueSnackbar(`Group was deleted!`, {
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

  const competitionGroupsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'groupId',
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
              dialogTitle={'Do you really want to delete this group?'}
              dialogDescription={'Group will be completely delete'}
              dialogNegativeText={'No, keep group'}
              dialogPositiveText={'Yes, delete group'}
              onDialogClosePositive={() => {
                deletedItemId.current = params.row.groupId
                deleteGroup({
                  variables: {
                    where: { groupId: params.row.groupId },
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
        field: 'teamsLimit',
        headerName: 'Limit',
        width: 120,
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

  const searchIndexes = React.useMemo(
    () => ['name', 'nick', 'short', 'status', 'limit'],
    []
  )

  const queryData = React.useMemo(
    (): GridRowsProp[] => setIdFromEntityId(competition?.groups, 'groupId'),

    [competition]
  )

  const [searchText, searchData, requestSearch] = useXGridSearch({
    searchIndexes,
    data: queryData,
  })

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography>Groups</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Error message={queryError?.message} />
        {competition && (
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
                columns={competitionGroupsColumns}
                rows={searchData}
                loading={queryLoading}
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
                    field: 'season',
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
  data: Group | null
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

  const [createCompetitionGroup, { loading: mutationLoadingCreate }] =
    useMutation(CREATE_COMPETITION_GROUP, {
      update(
        cache,
        {
          data: {
            createGroups: { groups },
          },
        }
      ) {
        try {
          const queryResult = cache.readQuery<TQueryTypeData, TQueryTypeVars>({
            query: GET_GROUPS,
            variables: {
              where: { competitionId },
            },
          })

          const existingData = queryResult?.competitions?.[0]?.groups || []
          const newItem = groups?.[0]
          let updatedData = []
          if (existingData?.find(ed => ed.groupId === newItem.groupId)) {
            // replace if item exist in array
            updatedData = existingData?.map(ed =>
              ed.groupId === newItem.groupId ? newItem : ed
            )
          } else {
            // add new item if item not in array
            updatedData = [newItem, ...existingData]
          }

          const updatedResult = {
            competitions: [
              {
                ...queryResult?.competitions?.[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
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
        enqueueSnackbar('Competition group created!', { variant: 'success' })
        handleCloseDialog()
        setSelectedSeason(undefined)
      },
    })

  const [updateCompetitionGroup, { loading: mutationLoadingUpdate }] =
    useMutation(UPDATE_COMPETITION_GROUP, {
      onCompleted: () => {
        enqueueSnackbar('Competition group updated!', { variant: 'success' })
      },
    })

  const handleSeasonChange = useCallback(
    selected => {
      updateCompetitionGroup({
        variables: {
          where: {
            groupId: data?.groupId,
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
        const { teamsLimit, ...rest } = dataToCheck

        data?.groupId
          ? updateCompetitionGroup({
              variables: {
                where: {
                  groupId: data?.groupId,
                },
                update: {
                  ...rest,
                  teamsLimit: `${teamsLimit}`,
                },
              },
            })
          : createCompetitionGroup({
              variables: {
                input: {
                  ...rest,
                  teamsLimit: `${teamsLimit}`,
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
        <DialogTitle id="alert-dialog-title">{`Add new group to ${competition?.name}`}</DialogTitle>
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
                      defaultValue={data?.nick || ''}
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
                      defaultValue={data?.short || ''}
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
                      defaultValue={data?.teamsLimit || ''}
                      control={control}
                      name="teamsLimit"
                      label="Teams Limit"
                      fullWidth
                      required
                      variant="standard"
                      error={errors?.teamsLimit}
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
                    {data?.groupId && (
                      <Autocomplete
                        id="group-season-select"
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
                              autoComplete: 'new-password',
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

const sortByName = (a: { name: string }, b: { name: string }) => {
  if (a?.name < b?.name) {
    return 1
  }
  if (a?.name > b?.name) {
    return -1
  }
  return 0
}

export { Groups }
