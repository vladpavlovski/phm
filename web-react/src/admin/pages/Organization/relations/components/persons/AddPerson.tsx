import { Error, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { Organization } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Switch from '@mui/material/Switch'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

export const GET_ALL_PERSONS = gql`
  query getPersons {
    people {
      personId
      name
      firstName
      lastName
      name
      orgs {
        organizationId
        name
      }
      occupations {
        occupationId
        name
      }
    }
  }
`

type TAddPerson = {
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

const AddPerson: React.FC<TAddPerson> = props => {
  const { organization } = props

  const [openAddPerson, setOpenAddPerson] = useState(false)

  const handleCloseAddPerson = useCallback(() => {
    setOpenAddPerson(false)
  }, [])

  const [
    getAllPersons,
    {
      loading: queryAllPersonsLoading,
      error: queryAllPersonsError,
      data: queryAllPersonsData,
    },
  ] = useLazyQuery(GET_ALL_PERSONS, {
    fetchPolicy: 'cache-and-network',
  })

  const handleOpenAddPerson = useCallback(() => {
    if (!queryAllPersonsData) {
      getAllPersons()
    }
    setOpenAddPerson(true)
  }, [])

  const allPersonsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Name',
        width: 200,
      },
      {
        field: 'organizations',
        headerName: 'Organizations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.organizations, 'name')
        },
      },
      {
        field: 'occupations',
        headerName: 'Occupations',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row.occupations, 'name')
        },
      },

      {
        field: 'personId',
        headerName: 'Member',
        width: 150,
        disableColumnMenu: true,
        renderCell: params => {
          return <ToggleNewPerson personId={params.value} {...props} />
        },
      },
    ],
    [organization]
  )

  return (
    <>
      <Button
        type="button"
        onClick={handleOpenAddPerson}
        variant={'outlined'}
        size="small"
        startIcon={<AddIcon />}
      >
        Add Person
      </Button>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAddPerson}
        onClose={handleCloseAddPerson}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        {queryAllPersonsLoading && <Loader />}
        <Error message={queryAllPersonsError?.message} />
        {queryAllPersonsData && (
          <>
            <DialogTitle id="alert-dialog-title">{`Add new person to ${
              organization && organization.name
            }`}</DialogTitle>
            <DialogContent>
              <div style={{ height: 600, width: '100%' }}>
                <DataGridPro
                  columns={allPersonsColumns}
                  rows={setIdFromEntityId(
                    queryAllPersonsData.people,
                    'personId'
                  )}
                  disableSelectionOnClick
                  loading={queryAllPersonsLoading}
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
              handleCloseAddPerson()
            }}
          >
            {'Done'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

type TToggleNew = {
  personId: string
  organizationId: string
  organization: Organization
  updateOrganization: MutationFunction
}

const ToggleNewPerson: React.FC<TToggleNew> = props => {
  const { personId, organizationId, organization, updateOrganization } = props
  const [isMember, setIsMember] = useState(
    !!organization.persons.find(p => p.personId === personId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateOrganization({
          variables: {
            where: {
              organizationId,
            },
            update: {
              persons: {
                ...(!isMember
                  ? {
                      connect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }
                  : {
                      disconnect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }),
              },
            },
          },
        })
        // isMember
        //   ? remove({
        //       variables: {
        //         organizationId,
        //         personId,
        //       },
        //     })
        //   : merge({
        //       variables: {
        //         organizationId,
        //         personId,
        //       },
        //     })
        setIsMember(!isMember)
      }}
      name="organizationMember"
      color="primary"
    />
  )
}

export { AddPerson }
