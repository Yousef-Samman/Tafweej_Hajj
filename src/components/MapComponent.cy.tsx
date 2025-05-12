import React from 'react'
import MapComponent, { MOCK_CROWD_DATA } from './MapComponent'

describe('<MapComponent />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MapComponent crowdData={MOCK_CROWD_DATA} />)
  })
})