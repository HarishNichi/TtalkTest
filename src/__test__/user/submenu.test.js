import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SubMenu from "../../components/User/userSubmenu";

describe("SubMenu", () => {
  test("handles text click correctly", () => {
    const onTextClickMock = jest.fn();
    const { getByText } = render(<SubMenu onTextClick={onTextClickMock} />);

    // Click on the last text
    fireEvent.click(getByText("ログを見る"));
    expect(onTextClickMock).toHaveBeenCalledWith(11);
  });

  test("renders without errors", () => {
    render(<SubMenu onTextClick={() => {}} />);
    // Add your assertions here
  });

  test("displays correct text", () => {
    const onTextClickMock = jest.fn();
    const { getByText } = render(<SubMenu onTextClick={onTextClickMock} />);

    // Check if the first text is displayed
    expect(getByText("ユーザーの詳細")).toBeInTheDocument();

    // Check if the last text is displayed
    expect(getByText("ログを見る")).toBeInTheDocument();
  });

  test("invokes onTextClick callback when a text is clicked", () => {
    const onTextClickMock = jest.fn();
    render(<SubMenu onTextClick={onTextClickMock} />);
    const textIndex = 2; // Assuming the third text is clicked
    const textButton = screen.getByText("クイックPTT");
    fireEvent.click(textButton);
    expect(onTextClickMock).toHaveBeenCalledWith(textIndex);
  });
});
