import React from "react";
import { render, screen } from "@testing-library/react";
import IconOutlineBtn from "../../components/Button/iconOutlineBtn";
import "@testing-library/jest-dom";

describe("IconOutlineBtn", () => {
  test("renders button with icon and text", () => {
    // const mockIcon = jest.fn(() => <svg>Mock Icon</svg>);
    // const buttonText = "Button Text";

    // render(
    //   <IconOutlineBtn
    //     icon={mockIcon}
    //     text={buttonText}
    //     borderColor="border-customBlue"
    //     textColor="text-white"
    //     textBold={true}
    //   />
    // );

    // Assert the button is rendered with the provided text and icon
    // expect(screen.getByRole("button")).toBeInTheDocument();
    // expect(screen.getByText(buttonText)).toBeInTheDocument();
    // expect(screen.getByText("Mock Icon")).toBeInTheDocument();

    // Assert the button has the correct CSS classes applied
    // expect(screen.getByRole("button")).toHaveClass("border-customBlue");
    // expect(screen.getByRole("button")).toHaveClass("bg-transparent");
    // expect(screen.getByRole("button")).toHaveClass("hover:bg-grey");
    // expect(screen.getByRole("button")).toHaveClass("font-bold");
    // expect(screen.getByRole("button")).toHaveClass("text-white");
    // expect(screen.getByRole("button")).toHaveClass("items-center");
  });
});
