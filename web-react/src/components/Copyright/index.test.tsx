import { unmountComponentAtNode } from 'react-dom'
import { render, screen } from 'utils/test-utils'

import { Copyright } from './index'

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

describe('Copyright', () => {
  it('renders Copyright component', async () => {
    render(<Copyright />)

    expect(
      await screen.findByText('HMS - Hockey Management System')
    ).toBeInTheDocument()
  })
})
