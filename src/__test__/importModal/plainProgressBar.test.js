import React from "react";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import ProgressBar from "../../components/ImportModal/plainProgressBar";

describe("ProgressBar", () => {
  /**
   * Test case: renders file name and close icon.
   * - Renders the ProgressBar component with the provided props.
   * - Asserts that the file name is rendered.
   * - Asserts that the progress bar is rendered.
   * - Asserts that the close icon is rendered.
   */
  test("renders file name and close icon", () => {
    const fileName = "FileName.css";
    const percentage = 50;
    const onClick = jest.fn();

    const { getByTestId } = render(
      <ProgressBar fileName={fileName} percentage={percentage} onClick={onClick} />
    );

    // Assert that the file name is rendered
    const fileNameElement = getByTestId("file-name");
    expect(fileNameElement).toBeInTheDocument();

    // Assert that the progress bar is rendered
    const progressBarElement = getByTestId("plain-bar");
    expect(progressBarElement).toBeInTheDocument();

    // Assert that the close icon is rendered
    const closeIconElement = getByTestId("close-icon");
    expect(closeIconElement).toBeInTheDocument();
  });
});
