import React from 'react'
import MapComponent from './MapComponent'

describe('<MapComponent />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MapComponent />)
  })
})