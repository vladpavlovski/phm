import React, { useContext, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Paper from '@mui/material/Paper'
import { gql, useLazyQuery } from '@apollo/client'
import { useParams, useHistory } from 'react-router-dom'
import * as ROUTES from 'router/routes'
import LayoutContext from 'context/layout'
import OrganizationContext from 'context/organization'
import { Loader, Error } from 'components'
import { useStyles } from '../../commonComponents/styled'

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
  const theme = useTheme()
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

  const classes = useStyles(theme)

  return (
    <Container maxWidth="lg" className={classes.container}>
      {queryLoading && <Loader />}
      <Error message={queryError?.message} />
      {organizationData?.organizationId && (
        <>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8} lg={7}>
              <Paper
                className={classes.paper}
              >{`Organization Info: ${organizationData?.name}`}</Paper>
            </Grid>
            <Grid item xs={12} md={4} lg={5}>
              <Paper className={classes.paper}>{/* <UserCount /> */}</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.paper}></Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Container>
  )
}

export { OrganizationDashboard as default }
