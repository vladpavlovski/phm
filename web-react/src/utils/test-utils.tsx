import React, { FC, ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import '@testing-library/jest-dom'

import AdapterDayJs from '@mui/lab/AdapterDayjs'
import { ThemeProvider } from '@mui/material/styles'
import LocalizationProvider from '@mui/lab/LocalizationProvider'
import { SnackbarProvider } from 'notistack'
import { LayoutProvider } from 'context/layout/Provider'
import { OrganizationProvider } from 'context/organization'

import theme from 'styles/global'

const AllTheProviders: FC = ({ children }) => {
  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayJs}>
        <SnackbarProvider maxSnack={5}>
          <OrganizationProvider>
            <LayoutProvider>{children}</LayoutProvider>
          </OrganizationProvider>
        </SnackbarProvider>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export * from '@testing-library/user-event'

export { customRender as render }
