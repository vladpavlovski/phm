import React, { useCallback, useState } from 'react'
import { gql, useLazyQuery, useMutation } from '@apollo/client'
import PropTypes from 'prop-types'
import { useSnackbar } from 'notistack'

import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'

import { Loader } from '../../../../../components/Loader'
import { Error } from '../../../../../components/Error'
import { useStyles } from '../../../commonComponents/styled'

import { TextField, Autocomplete, Grid } from '@material-ui/core'

const GET_ORGANIZATIONS = gql`
  query getCompetitionOrganizations($competitionId: ID) {
    competition: Competition(competitionId: $competitionId) {
      competitionId
      name
      organization {
        organizationId
        name
      }
    }
    organizations: Organization {
      organizationId
      name
    }
  }
`

const REMOVE_MERGE_COMPETITION_ORGANIZATION = gql`
  mutation removeMergeCompetitionOrganization(
    $competitionId: ID!
    $organizationIdToRemove: ID!
    $organizationIdToMerge: ID!
  ) {
    competitionOrganizationRemove: RemoveCompetitionOrganization(
      from: { competitionId: $competitionId }
      to: { organizationId: $organizationIdToRemove }
    ) {
      from {
        competitionId
        name
      }
      to {
        organizationId
        name
      }
    }
    competitionOrganizationMerge: MergeCompetitionOrganization(
      from: { competitionId: $competitionId }
      to: { organizationId: $organizationIdToMerge }
    ) {
      from {
        competitionId
        name
      }
      to {
        organizationId
        name
      }
    }
  }
`

const Organization = props => {
  const { competitionId } = props
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()

  const [selectedOrganization, setSelectedOrganization] = useState(null)

  const [
    getData,
    { loading: queryLoading, error: queryError, data: queryData },
  ] = useLazyQuery(GET_ORGANIZATIONS, {
    fetchPolicy: 'cache-and-network',
    onCompleted: data => {
      setSelectedOrganization(data?.competition?.[0]?.organization)
    },
  })

  const competition = queryData?.competition?.[0]

  const [removeMergeOrganizationCompetition] = useMutation(
    REMOVE_MERGE_COMPETITION_ORGANIZATION,
    {
      onCompleted: data => {
        enqueueSnackbar(
          `${competition.name} owned by ${data.competitionOrganizationMerge.to.name}!`,
          {
            variant: 'success',
          }
        )
        setSelectedOrganization(data.competitionOrganizationMerge.to)
      },
      onError: error => {
        enqueueSnackbar(`Error happened :( ${error}`, {
          variant: 'error',
        })
        console.error(error)
      },
    }
  )

  const openAccordion = useCallback(() => {
    if (!queryData) {
      getData({ variables: { competitionId } })
    }
  }, [])

  const handleOrganizationChange = useCallback(
    data => {
      if (selectedOrganization.organizationId !== data.organizationId) {
        removeMergeOrganizationCompetition({
          variables: {
            competitionId,
            organizationIdToRemove: selectedOrganization.organizationId,
            organizationIdToMerge: data.organizationId,
          },
        })
      }
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
        <Typography className={classes.accordionFormTitle}>
          Organization
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {queryLoading && !queryError && <Loader />}
        {queryError && !queryLoading && <Error message={queryError.message} />}
        {queryData && (
          <>
            <Grid container spacing={2}>
              <Grid item xs={12} md={12} lg={12}>
                <Autocomplete
                  id="organization-select"
                  name="organization"
                  value={selectedOrganization}
                  getOptionLabel={option => option.name}
                  getOptionSelected={(option, value) =>
                    option.organizationId === value.organizationId
                  }
                  options={queryData.organizations}
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
                      // label="Organization"
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

Organization.propTypes = {
  competitionId: PropTypes.string,
}

export { Organization }
