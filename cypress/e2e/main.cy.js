// E2E test for Tafweej Hajj following the actual workflow

describe('Tafweej Hajj E2E', () => {
  it('should redirect unauthenticated users from home to identify', () => {
    cy.visit('http://localhost:3001/');
    cy.url().should('include', '/identify');
  });

  it('should allow admin to log in and access alerts', () => {
    cy.visit('http://localhost:3001/identify');
    cy.contains('Admin').click();
    cy.url().should('include', '/login?type=admin');
    cy.get('input[type="email"]').type('yousef.m.samman@gmail.com');
    cy.get('input[type="password"]').type('yousef');
    cy.get('button[type="submit"]').click();
    cy.url().should('not.include', '/login');
    cy.visit('http://localhost:3001/alerts');
    cy.contains('Safety Alerts');
    cy.visit('http://localhost:3001/map');
    cy.contains('Crowd Density Map');
  });

  // Placeholder for pilgrim workflow
  // it('should allow pilgrim to log in and access main dashboard', () => {
  //   cy.visit('http://localhost:3001/identify');
  //   cy.contains('Pilgrim').click();
  //   cy.url().should('include', '/pilgrim/signin');
  //   cy.get('input[type="email"]').type('pilgrim@example.com');
  //   cy.get('input[type="password"]').type('pilgrimpassword');
  //   cy.get('button[type="submit"]').click();
  //   cy.url().should('include', '/pilgrim/main');
  // });
}); 