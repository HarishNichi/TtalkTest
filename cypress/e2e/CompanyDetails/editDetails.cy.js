describe("Company Information", () => {
  beforeEach(() => {
    cy.setMobileViewport();
    cy.visit("company/edit");
    cy.get(".w-full.h-full.bg-white.drop-shadow-lg").then(($sidebar) => {
      if ($sidebar.is(":visible")) {
        $sidebar.css("display", "none");
      }
    });
  });

  it("displays the page title", () => {
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

  it("clicks on buttons", () => {
    cy.contains("保存").click({ force: true });
    // Add assertions or additional actions related to clicking on the button
  });
});
