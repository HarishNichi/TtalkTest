describe("Company Information", () => {
  beforeEach(() => {
    cy.setMobileViewport();
    cy.visit("/company/settings");
    cy.get(".w-full.h-full.bg-white.drop-shadow-lg").then(($sidebar) => {
      if ($sidebar.is(":visible")) {
        $sidebar.css("display", "none");
      }
    });
  });

  it("displays the page title", () => {
    cy.contains("会社の設定").should("be.visible");
    cy.contains("会社名").should("be.visible");
    cy.contains("パスワード").should("be.visible");
    cy.contains("管理者ID").should("be.visible");
  });

  it("fills out the form fields", () => {
    cy.get("input#companyName").type("My Company", { force: true });
    cy.get("input#password").type("Test@123", { force: true });
    cy.get("input#adminId").type("123", { force: true });
    // Add more assertions or actions for filling out the form fields
  });
});
