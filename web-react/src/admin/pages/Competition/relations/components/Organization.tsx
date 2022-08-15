import { Error, Loader } from 'components'
import React from 'react'
import { Competition, Organization as OrganizationType } from 'utils/types'
import { gql, MutationFunction, useLazyQuery } from '@apollo/client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Autocomplete from '@mui/material/Autocomplete'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'

const GET_ORGANIZATIONS = gql`
  query getCompetitionOrganizations($where: OrganizationWhere) {
    organizations(where: $where) {
      organizationId
      name
    }
  }
`

type TRelations = {
  competitionId: string
  competition: Competition
  updateCompetition: MutationFunction
}

const Organization: React.FC<TRelations> = props => {
  const { competitionId, competition, updateCompetition } = props

  const [selectedOrganization, setSelectedOrganization] = React.useState<
    OrganizationType | undefined
  >(competition?.org)

  const [
    getData,
    { loading: queryLoading, data: queryData, error: queryError },
  ] = useLazyQuery(GET_ORGANIZATIONS, {
    onCompleted: () => {
      setSelectedOrganization(competition?.org)
    },
  })

  const openAccordion = React.useCallback(() => {
    if (!queryData) {
      getData()
    }
  }, [])

  const handleOrganizationChange = React.useCallback(
    data => {
      setSelectedOrganization(data)
      updateCompetition({
        variables: {
          where: {
            competitionId,
          },
          update: {
            org: {
              connect: {
                where: {
                  node: { organizationId: data?.organizationId },
                },
              },
              disconnect: {
                where: {
                  node: {
                    organizationId:
                      selectedOrganization?.organizationId || null,
                  },
                },
              },
            },
          },
        },
      })
    },
    [competitionId, selectedOrganization]
  )

  return (
    <Accordion onChange={openAccordion}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="organizations-content"
        id="organizations-header"
      >
        <Typography>Organization</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && <Loader />}
        <Error message={queryError?.message} />
        {queryData && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Autocomplete
                  id="organization-select"
                  value={selectedOrganization}
                  getOptionLabel={option => option.name}
                  isOptionEqualToValue={(option, value) =>
                    option.organizationId === value.organizationId
                  }
                  // getOptionSelected={(option, value) =>
                  //   option.organizationId === value.organizationId
                  // }
                  options={queryData?.organizations}
                  onChange={(_, data) => {
                    handleOrganizationChange(data)
                  }}
                  renderOption={(props, option) => (
                    <li {...props} key={option.organizationId}>
                      {option.name}
                    </li>
                  )}
                  renderInput={params => (
                    <TextField
                      {...params}
                      fullWidth
                      variant="standard"
                      inputProps={{
                        ...params.inputProps,
                        autoComplete: 'new-password',
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </>
        )}
      </AccordionDetails>
    </Accordion>
  )
}

export { Organization }
