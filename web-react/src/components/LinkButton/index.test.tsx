import { render, screen } from 'utils/test-utils'
import { LinkButton } from './index'
import Link from '@mui/material/Link'

describe('LinkButton', () => {
  it(`should render link button component with internal Link`, async () => {
    const link = '/admin/dashboard'
    render(
      <LinkButton data-testid="internal-link" to={link}>
        Dashboard
      </LinkButton>
    )

    expect(screen.getByTestId('internal-link')).toHaveAttribute('href', link)
  })

  it(`should render link button component with external Link`, async () => {
    const link = 'https://test.com/'
    render(
      <LinkButton data-testid="external-link" href={link} component={Link}>
        External
      </LinkButton>
    )

    expect(screen.getByTestId('external-link')).toHaveAttribute('href', link)
  })
})
