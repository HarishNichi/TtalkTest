import React from "react";
import { render, screen } from "@testing-library/react";
import DropdownMedium from "../../components/Input/dropdownMedium";
import "@testing-library/jest-dom";

describe("DropdownMedium", () => {
  test("renders label with correct color", () => {
  //   const options = [
  //     { id: 1, name: "Option 1" },
  //     { id: 2, name: "Option 2" },
  //     { id: 3, name: "Option 3" },
  //   ];
  //   const labelColor = "red";
  //   const label = "Select Country";

  //   render(
  //     <DropdownMedium
  //       options={options}
  //       labelColor={labelColor}
  //       label={label}
  //       value={1}
  //     />
  //   );

  //   const labelElement = screen.getByText(label);
  //   expect(labelElement).toHaveStyle(`color: ${labelColor}`);
  // });

  // test("renders options correctly", () => {
  //   const options = [
  //     { id: 1, name: "Option 1" },
  //     { id: 2, name: "Option 2" },
  //     { id: 3, name: "Option 3" },
  //   ];
  //   const labelColor = "red";
  //   const label = "Select Country";

  //   render(
  //     <DropdownMedium
  //       options={options}
  //       labelColor={labelColor}
  //       label={label}
  //       value={1}
  //     />
  //   );

  //   const optionElements = screen.getAllByRole("option");

  //   options.forEach((option, index) => {
  //     const optionElement = optionElements[index];
  //     return optionElement;
  //   });
  });

  // Add more test cases as needed
});
