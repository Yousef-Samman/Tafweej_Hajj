import React from 'react'
import { ThemeProvider } from './ThemeProvider'

describe('<ThemeProvider />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    )
  })
})