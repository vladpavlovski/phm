import React, { useCallback, useState, useMemo, useRef } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import { useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { object, string, number } from 'yup'

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
import TextField from '@material-ui/core/TextField'
import Container from '@material-ui/core/Container'
import Grid from '@material-ui/core/Grid'
import LoadingButton from '@material-ui/lab/LoadingButton'
import { XGrid, GridToolbar } from '@material-ui/x-grid'

import { ButtonDialog } from '../../../commonComponents/ButtonDialog'
import { RHFInput } from '../../../../../components/RHFInput'
import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId, decomposeNumber } from '../../../../../utils'

const GET_GROUPS = gql`
  query getCompetition($where: CompetitionWhere) {
    competition: competitions(where: $where) {
      competitionId
      name
      groups {
        groupId
        name
        nick
        short
        teamsLimit
        season {
          seasonId
          name
        }
      }
    }
    seasons {
      seasonId
      name
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
  teamsLimit: number().integer().positive().required('Teams limit is required'),
})

const Groups = props => {
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
  ] = useLazyQuery(GET_GROUPS, {
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

  const [deleteGroup, { loading: mutationLoadingRemove }] = useMutation(
    DELETE_COMPETITION_GROUP,
    {
      update(cache) {
        try {
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              where: { competitionId },
            },
          })
          const updatedData = queryResult?.competition?.[0]?.groups?.filter(
            p => p.groupId !== deletedItemId.current
          )

          const updatedResult = {
            competition: [
              {
                ...queryResult.competition?.[0],
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

  const competitionGroupsColumns = useMemo(
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
    ],
    []
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="groups-content"
        id="groups-header"
      >
        <Typography className={classes.accordionFormTitle}>Groups</Typography>
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
                columns={competitionGroupsColumns}
                rows={setIdFromEntityId(competition?.groups, 'groupId')}
                loading={queryLoading}
                components={{
                  Toolbar: GridToolbar,
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
          const queryResult = cache.readQuery({
            query: GET_GROUPS,
            variables: {
              where: { competitionId },
              organizationSlug,
            },
          })

          const existingData = queryResult?.competition?.[0]?.groups
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
            competition: [
              {
                ...queryResult?.competition?.[0],
                groups: updatedData,
              },
            ],
          }
          cache.writeQuery({
            query: GET_GROUPS,
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
        enqueueSnackbar('Competition group created!', { variant: 'success' })
        handleCloseDialog()
        setSelectedSeason(null)
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
                  seasonId: selected?.seasonId || null,
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
                  teamsLimit: decomposeNumber(teamsLimit),
                },
              },
            })
          : createCompetitionGroup({
              variables: {
                input: {
                  ...rest,
                  teamsLimit: decomposeNumber(teamsLimit),
                  competition: {
                    connect: {
                      where: {
                        competitionId,
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
                      defaultValue={data?.teamsLimit}
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
                    {data?.groupId && (
                      <Autocomplete
                        id="group-season-select"
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

Groups.propTypes = {
  competitionId: PropTypes.string,
}

export { Groups }
