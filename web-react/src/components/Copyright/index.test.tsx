import { render, screen } from 'utils/test-utils'

import { Copyright } from './index'

describe('Copyright', () => {
  it('renders Copyright component', async () => {
    render(<Copyright />)

    expect(
      await screen.findByText('HMS - Hockey Management System')
    ).toBeInTheDocument()
  })
})
