import React from 'react'
import MapPage from './MapPage'

describe('<MapPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MapPage />)
  })
})