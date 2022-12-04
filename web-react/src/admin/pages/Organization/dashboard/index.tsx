import { Error, LinkButton, Loader } from 'components'
import LayoutContext from 'context/layout'
import OrganizationContext from 'context/organization'
import React, { useContext, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import * as ROUTES from 'router/routes'
import { gql, useLazyQuery } from '@apollo/client'
import PublishIcon from '@mui/icons-material/Publish'
import { Stack, Typography } from '@mui/material'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { ExternalLinks } from './components/ExternalLinks'

const GET_ORGANIZATIONS = gql`
  query getOrganizations($where: OrganizationWhere) {
    organizations(where: $where) {
      organizationId
      name
      nick
      urlSlug
    }
  }
`

type TParams = {
  organizationSlug: string
}

const OrganizationDashboard: React.FC = () => {
  const history = useHistory()
  const { organizationSlug } = useParams<TParams>()
  const { setBarTitle } = useContext(LayoutContext)
  const { organizationData, setOrganizationData } =
    useContext(OrganizationContext)

  const [getOrganizations, { loading: queryLoading, error: queryError }] =
    useLazyQuery(GET_ORGANIZATIONS, {
      variables: { where: { urlSlug: organizationSlug } },
      onCompleted: ({ organizations }) => {
        if (organizations) {
          const { organizationId, urlSlug, name, nick } = organizations?.[0]
          setOrganizationData({
            organizationId,
            urlSlug,
            name,
            nick,
          })
        } else {
          history.replace(ROUTES.NOT_FOUND)
        }
      },
    })

  useEffect(() => {
    if (
      organizationData?.organizationId &&
      organizationData?.urlSlug === organizationSlug
    ) {
      setBarTitle(organizationData?.name)
    } else {
      getOrganizations()
    }
    return () => {
      setBarTitle('')
    }
  }, [])

  return (
    <Container maxWidth="lg">
      {queryLoading && <Loader />}
      <Error message={queryError?.message} />
      {organizationData?.organizationId && (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={7}>
              <Paper sx={{ p: 2 }}>
                <Typography>
                  {`Organization Info: ${organizationData?.name}`}
                </Typography>
                <Stack justifyContent="space-between" direction="row">
                  <LinkButton
                    startIcon={<PublishIcon />}
                    type="button"
                    variant="outlined"
                    color="primary"
                    to={ROUTES.getAdminImportRoute(organizationData?.urlSlug)}
                  >
                    Import Data
                  </LinkButton>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={5}>
              <ExternalLinks />
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export { OrganizationDashboard as default }
