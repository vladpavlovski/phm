import { useSnackbar } from 'notistack'
import React, { useCallback, useMemo, useState } from 'react'
import { setIdFromEntityId } from 'utils'
import { Organization, Person } from 'utils/types'
import { gql, MutationFunction, useMutation } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'
import { OrganizationPersonsContext } from './index'

const UPDATE_PERSON = gql`
  mutation updatePerson($where: PersonWhere, $update: PersonUpdateInput) {
    updatePeople(where: $where, update: $update) {
      people {
        personId
        firstName
        lastName
        name
        occupations {
          occupationId
          name
        }
      }
    }
  }
`

type TSetPersonOccupation = {
  person: Person
}

export const SetPersonOccupation: React.FC<TSetPersonOccupation> = props => {
  const { person } = props

  const { update } = React.useContext(OrganizationPersonsContext)

  return (
    <Button
      type="button"
      onClick={() => {
        update({ personData: person, personOccupationDialogOpen: true })
      }}
      variant={'outlined'}
      size="small"
      startIcon={<AddIcon />}
    >
      Set Occupation
    </Button>
  )
}

type TPersonOccupationDialog = {
  organization: Organization
}

export const PersonOccupationDialog: React.FC<
  TPersonOccupationDialog
> = props => {
  const { organization } = props
  const { enqueueSnackbar } = useSnackbar()
  const { state, update } = React.useContext(OrganizationPersonsContext)

  const handleCloseDialog = useCallback(() => {
    update(state => ({
      ...state,
      personData: null,
      personOccupationDialogOpen: false,
    }))
  }, [])

  const [updatePerson] = useMutation(UPDATE_PERSON, {
    onCompleted: () => {
      enqueueSnackbar(`Person updated!`, {
        variant: 'success',
      })
    },
    onError: error => {
      enqueueSnackbar(`Error : ${error}`, {
        variant: 'error',
      })
      console.error(error)
    },
  })

  const organizationOccupationsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'occupationId',
        headerName: 'Has Occupation',
        width: 250,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            state.personData && (
              <ToggleOccupation
                occupationId={params.value}
                person={state.personData}
                updatePerson={updatePerson}
              />
            )
          )
        },
      },
    ],
    [state]
  )
  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={state?.personOccupationDialogOpen}
      onClose={handleCloseDialog}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      {organization?.occupations && (
        <>
          <DialogTitle id="alert-dialog-title">{`Set ${state?.personData?.name} occupations for ${organization?.name}`}</DialogTitle>
          <DialogContent>
            <div style={{ height: 600, width: '100%' }}>
              <DataGridPro
                columns={organizationOccupationsColumns}
                rows={setIdFromEntityId(
                  organization?.occupations,
                  'occupationId'
                )}
                disableSelectionOnClick
                components={{
                  Toolbar: GridToolbar,
                }}
              />
            </div>
          </DialogContent>
        </>
      )}
      <DialogActions>
        <Button onClick={handleCloseDialog}>{'Done'}</Button>
      </DialogActions>
    </Dialog>
  )
}

type TToggleOccupation = {
  occupationId: string
  person: Person
  updatePerson: MutationFunction
}

const ToggleOccupation: React.FC<TToggleOccupation> = props => {
  const { occupationId, person, updatePerson } = props
  const [isMember, setIsMember] = useState(
    !!person?.occupations?.find(p => p.occupationId === occupationId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updatePerson({
          variables: {
            where: {
              personId: person.personId,
            },
            update: {
              occupations: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            occupationId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            occupationId,
                          },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="organizationMember"
      color="primary"
    />
  )
}
