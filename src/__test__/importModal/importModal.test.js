import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import ImportModal from "../../components/ImportModal/importModal";

describe("ImportModal", () => {
  /**
   * Test case: renders file upload and progress bar.
   * - Renders the ImportModal component.
   * - Asserts that the file upload component is rendered.
   * - Asserts that the progress bar is rendered.
   * - Asserts that the import button is rendered.
   * - Asserts that the import text elements are rendered.
   */
  test("renders file upload and progress bar", () => {
    render(<ImportModal />);

    // Assert that the file upload component is rendered
    const fileUploadElement = screen.getByTestId("file-upload");
    expect(fileUploadElement).toBeInTheDocument();

    // Assert that the progress bar is rendered
    const progressBarElement = screen.getByTestId("progress-bar");
    expect(progressBarElement).toBeInTheDocument();

    // Assert that the import text elements are rendered
    const importTextElements = screen.queryAllByText("インポート");
    expect(importTextElements.length).toBeGreaterThan(0);
  });
});
