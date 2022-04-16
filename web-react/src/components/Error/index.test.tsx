import { render, screen } from 'utils/test-utils'

import { Error } from './index'

describe('Error', () => {
  it('renders Error component', async () => {
    const message = 'Error message goes here'

    render(<Error message={message} />)

    expect(await screen.findByText(message)).toBeInTheDocument()
  })
})
