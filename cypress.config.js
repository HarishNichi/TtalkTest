const { defineConfig } = require("cypress");

module.exports = defineConfig({
  viewportWidth: 1280,  // Set the default width
  viewportHeight: 800,  // Set the default height
  e2e: {
    baseUrl: "http://localhost:3000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },

});
