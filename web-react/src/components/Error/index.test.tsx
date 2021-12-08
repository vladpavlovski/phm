import { unmountComponentAtNode } from 'react-dom'
import { render, screen } from 'utils/test-utils'

import { Error } from './index'

let container: any = null
beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  unmountComponentAtNode(container)
  container.remove()
  container = null
})

describe('Error', () => {
  it('renders Error component', async () => {
    const message = 'Error message goes here'

    render(<Error message={message} />)

    expect(await screen.findByText(message)).toBeInTheDocument()
  })
})
