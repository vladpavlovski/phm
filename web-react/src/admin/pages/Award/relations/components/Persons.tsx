import { Error, LinkButton, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAdminOrgPersonRoute } from 'router/routes'
import { getXGridValueFromArray, setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import AccountBox from '@mui/icons-material/AccountBox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

export const GET_ALL_PERSONS = gql`
  query getPersons($where: PersonWhere) {
    persons: people(where: $where) {
      personId
      firstName
      lastName
      name
      teams {
        teamId
        name
      }
      games {
        gameId
        name
      }
      competitions {
        competitionId
        name
      }
    }
  }
`

type TRelations = {
  awardId: string
  award: Award
  updateAward: MutationFunction
}

type TParams = {
  organizationSlug: string
}

const Persons: React.FC<TRelations> = props => {
  const { awardId, award, updateAward } = props
  const { organizationSlug } = useParams<TParams>()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PERSONS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { where: { orgs: { urlSlug: organizationSlug } } } })
    }
  }, [])

  const awardPersonsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'personId',
        headerName: 'Profile',
        width: 120,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <LinkButton
              startIcon={<AccountBox />}
              to={getAdminOrgPersonRoute(organizationSlug, params.value)}
              target="_blank"
            >
              Profile
            </LinkButton>
          )
        },
      },
      {
        field: 'name',
        headerName: 'Name',
        width: 150,
      },

      {
        field: 'teamName',
        headerName: 'Team Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.teams, 'name')
        },
      },

      {
        field: 'gameName',
        headerName: 'Game Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.games, 'name')
        },
      },
      {
        field: 'competitionName',
        headerName: 'Competition Name',
        width: 200,
        valueGetter: params => {
          return getXGridValueFromArray(params.row?.competition, 'name')
        },
      },
      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              personId={params.row.personId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },
    ],
    [organizationSlug, award]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="persons-content"
        id="persons-header"
      >
        <Typography>Persons</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardPersonsColumns}
              rows={setIdFromEntityId(queryData?.persons, 'personId')}
              loading={queryLoading}
              components={{
                Toolbar: GridToolbar,
              }}
            />
          </div>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

type TToggleNew = {
  awardId: string
  personId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = props => {
  const { personId, awardId, award, updateAward } = props
  const [isMember, setIsMember] = useState(
    !!award?.persons?.find(p => p.personId === personId)
  )

  return (
    <Switch
      checked={isMember}
      onChange={() => {
        updateAward({
          variables: {
            where: {
              awardId,
            },
            update: {
              persons: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            personId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { personId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="personMember"
      color="primary"
    />
  )
}

export { Persons }
