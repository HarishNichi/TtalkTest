describe("Company Information", () => {
  beforeEach(() => {
    cy.setWebViewport();
    cy.visit("/company/details");
  });

  it("displays the page title", () => {
    cy.contains("会社の詳細").should("be.visible");
    cy.contains("会社名").should("be.visible");
    cy.contains("連絡先メールアドレス").should("be.visible");
    cy.contains("住所").should("be.visible");
    cy.contains("ユーザー数").should("be.visible");
    cy.contains("説明").should("be.visible");
  });

  it("fills out the form fields", () => {
    cy.get("input#companyName").type("My Company", { force: true });
    cy.get("input#mailId").type("contact@example.com", { force: true });
    cy.get("textarea#address").type("123 Main St", { force: true });
    cy.get("input#userCount").type("10", { force: true });
    cy.get("textarea#description").type("This is a description", {
      force: true,
    });
    // Add more assertions or actions for filling out the form fields
  });
});
