describe("Update Password", () => {
  beforeEach(() => {
    cy.visit(`/update-password`);
  });

  it("displays the dynamic label correctly", () => {
    cy.contains("パスワードを変更").should("be.visible");
  });

  it("allows user to enter a new password", () => {
    //type command is to type the value
    cy.get("input#newPassword").type("myPassword123", { force: true });
    // Enter the new password in the input field
    cy.get("input#newPassword").should("have.value", "myPassword123");
  });

  it("allows user to select an option from the dropdown", () => {
    // Trigger the dropdown and force the selection of an option
    cy.get('select[id="userId"]').select("option 01", { force: true });

    // Assert that the selected value is as expected
    cy.get('select[id="userId"]').should("have.value", "1");
  });

  it('submits the form when the "保存" button is clicked', () => {
    // Scroll the button into view
    cy.get('button[type="submit"]').scrollIntoView().should("be.visible"); // Ensure the button is visible

    // Click the button
    cy.get('button[type="submit"]').click({ force: true });
    // Add assertions or perform actions after the form submission
  });
});
