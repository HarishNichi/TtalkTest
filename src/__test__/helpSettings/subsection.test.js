import React from "react";
import { render, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import SubSection from "../../components/HelpSettings/subsection";

describe("SubSection", () => {
  const tabs = [
    { name: "Item 1", subSetId: 101, setId: 201 },
    { name: "Item 2", subSetId: 102, setId: 202 },
    { name: "Item 3", subSetId: 103, setId: 203 },
  ];

  it("should handle tab click", () => {
    const handleTabClick = jest.fn();
    const handleEditClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const { getByText } = render(
      <SubSection
        tabs={tabs}
        handleTabClick={handleTabClick}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
      />
    );

    fireEvent.click(getByText("Item 2"));
    expect(handleTabClick).toHaveBeenCalledWith(1, tabs[1]);
  });

  it("should handle delete tab click", () => {
    const handleTabClick = jest.fn();
    const handleEditClick = jest.fn();
    const handleDeleteClick = jest.fn();
    const { getByTestId } = render(
      <SubSection
        tabs={tabs}
        handleTabClick={handleTabClick}
        handleEditClick={handleEditClick}
        handleDeleteClick={handleDeleteClick}
      />
    );
    fireEvent.click(getByTestId("delete-1"));
    expect(handleDeleteClick).toHaveBeenCalledTimes(1);
    expect(handleDeleteClick).toHaveBeenCalledWith(tabs[1]);
  });
});
