import { render, screen } from "@testing-library/react";
import DynamicLabel from "../../components/Label/dynamicLabel";
import "@testing-library/jest-dom";

describe("DynamicLabel", () => {
    
  /**
   * Test case: renders label with provided props.
   * - Renders the DynamicLabel component with the provided props.
   * - Asserts that the label is rendered with the correct text, alignment, font size, font weight, text color, and visibility.
   */
  test("renders label with provided props", () => {
    const alignment = "text-center";
    const fontSize = "text-lg";
    const fontWeight = "font-light";
    const text = "LOGIN";
    const textColor = "#19388B";
    const disabled = false;

    render(
      <DynamicLabel
        text={text}
        alignment={alignment}
        fontSize={fontSize}
        fontWeight={fontWeight}
        textColor={textColor}
        disabled={disabled}
      />
    );

    const label = screen.getByText(text);

    expect(label).toBeInTheDocument();
    expect(label).toHaveClass(alignment);
    expect(label).toHaveClass(fontSize);
    expect(label).toHaveClass(fontWeight);
    expect(label).toHaveStyle(`color: ${textColor}`);
    expect(label).not.toHaveAttribute("disabled");
    expect(label).toBeVisible();
  });

  /**
   * Test case: renders disabled label.
   * - Renders the DynamicLabel component with the provided props and disabled set to true.
   * - Asserts that the label is rendered with the disabled style and not-allowed cursor style.
   */
  test("renders disabled label", () => {
    const alignment = "text-center";
    const fontSize = "text-lg";
    const fontWeight = "font-light";
    const text = "LOGIN";
    const textColor = "#19388B";
    const disabled = true;

    render(
      <DynamicLabel
        text={text}
        alignment={alignment}
        fontSize={fontSize}
        fontWeight={fontWeight}
        textColor={textColor}
        disabled={disabled}
      />
    );

    const label = screen.getByText(text);
    expect(label).toHaveStyle("opacity: 0.5");
    expect(label).toHaveStyle("cursor: not-allowed");
  });

  /**
   * Test case: renders label without className.
   *  Renders the DynamicLabel component without any className provided.
   *  Asserts that the label is rendered without the specified font size class.
   *  Note: This test case covers the scenario where the font size is not specified and should not have the font size class.
   *   It does not need to be repeated for every label.
   */
  test("renders label without className", () => {
    const alignment = undefined;
    const fontSize = undefined;
    const fontWeight = undefined;
    const text = "LOGIN";
    const textColor = "#19388B";
    const disabled = false;

    render(
      <DynamicLabel
        text={text}
        alignment={alignment}
        fontSize={fontSize}
        fontWeight={fontWeight}
        textColor={textColor}
        disabled={disabled}
      />
    );

    const label = screen.queryByText(text);
    expect(label).toBeInTheDocument();
    expect(label).not.toHaveClass("text-lg");
  });
});
