import { Error, Loader } from 'components'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { DataGridPro, GridColumns, GridToolbar } from '@mui/x-data-grid-pro'

export const GET_ALL_GROUPS = gql`
  query getGroups($where: GroupWhere) {
    groups(where: $where) {
      groupId
      name
      nick
      competition {
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

const Groups: React.FC<TRelations> = props => {
  const { awardId, updateAward, award } = props

  const { organizationSlug } = useParams<TParams>()
  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_GROUPS)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({
        variables: {
          where: { competition: { org: { urlSlug: organizationSlug } } },
        },
      })
    }
  }, [])

  const awardGroupsColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Group Name',
        width: 150,
      },

      {
        field: 'competitionName',
        headerName: 'Competition Name',
        width: 200,
        valueGetter: params => params.row?.competition?.name,
      },
      {
        field: 'hasAward',
        headerName: 'Has award',
        width: 200,
        disableColumnMenu: true,
        renderCell: params => {
          return (
            <ToggleNew
              groupId={params.row.groupId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
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
        <Typography>Groups</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardGroupsColumns}
              rows={setIdFromEntityId(queryData?.groups, 'groupId')}
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
  groupId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { groupId, awardId, updateAward, award } = props
  const [isMember, setIsMember] = useState(
    !!award?.groups?.find(p => p.groupId === groupId)
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
              groups: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            groupId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { groupId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="groupMember"
      color="primary"
    />
  )
})

export { Groups }
