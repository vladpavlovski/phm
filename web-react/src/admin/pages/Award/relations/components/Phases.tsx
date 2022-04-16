import React, { useCallback, useState, useMemo } from 'react'
import { gql, useLazyQuery, MutationFunction } from '@apollo/client'

import { useParams } from 'react-router-dom'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Switch from '@mui/material/Switch'

import { DataGridPro, GridToolbar, GridColumns } from '@mui/x-data-grid-pro'
import { Error, Loader } from 'components'
import { useStyles } from '../../../commonComponents/styled'
import { setIdFromEntityId } from 'utils'
import { Award } from 'utils/types'

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

  const classes = useStyles()
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
        <Typography className={classes.accordionFormTitle}>Phases</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <div style={{ height: 600 }} className={classes.xGridDialog}>
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
