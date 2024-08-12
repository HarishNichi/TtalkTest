Cypress.Commands.add("setMobileViewport", () => {
    cy.viewport(360, 800);
  });
  
  Cypress.Commands.add("setTabletViewport", () => {
    cy.viewport(774, 1133);
  });
  
  Cypress.Commands.add("setWebViewport", () => {
    cy.viewport(1440, 1024);
  });
  