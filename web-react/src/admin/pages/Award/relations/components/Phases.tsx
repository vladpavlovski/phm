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

export const GET_ALL_PHASES = gql`
  query getPhases($where: PhaseWhere) {
    phases(where: $where) {
      phaseId
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

const Phases: React.FC<TRelations> = props => {
  const { awardId, updateAward, award } = props

  const { organizationSlug } = useParams<TParams>()

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ALL_PHASES)

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({
        variables: {
          where: { competition: { org: { urlSlug: organizationSlug } } },
        },
      })
    }
  }, [])

  const awardPhasesColumns = useMemo<GridColumns>(
    () => [
      {
        field: 'name',
        headerName: 'Phase Name',
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
              phaseId={params.row.phaseId}
              awardId={awardId}
              award={award}
              updateAward={updateAward}
            />
          )
        },
      },
    ],
    [award]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="phases-content"
        id="phases-header"
      >
        <Typography>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600, width: '100%' }}>
            <DataGridPro
              disableMultipleSelection
              disableSelectionOnClick
              columns={awardPhasesColumns}
              rows={setIdFromEntityId(queryData?.phases, 'phaseId')}
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
  phaseId: string
  award: Award
  updateAward: MutationFunction
}

const ToggleNew: React.FC<TToggleNew> = React.memo(props => {
  const { phaseId, awardId, updateAward, award } = props
  const [isMember, setIsMember] = useState(
    !!award?.phases?.find(p => p.phaseId === phaseId)
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
              phases: {
                ...(isMember
                  ? {
                      disconnect: {
                        where: {
                          node: {
                            phaseId,
                          },
                        },
                      },
                    }
                  : {
                      connect: {
                        where: {
                          node: { phaseId },
                        },
                      },
                    }),
              },
            },
          },
        })
        setIsMember(!isMember)
      }}
      name="phaseMember"
      color="primary"
    />
  )
})

export { Phases }
