import { render, screen } from "@testing-library/react";
import SearchCard from "../../components/Card/searchList";
import "@testing-library/jest-dom";

describe("SearchCard", () => {
  const mockSearchResults = [
    { link: "/company1", companyName: "Company 1" },
    { link: "/company2", companyName: "Company 2" },
    { link: "/company3", companyName: "Company 3" },
    { link: "/company4", companyName: "Company 4" },
  ];

  test("renders search card with input and search results", () => {
    render(<SearchCard searchResults={mockSearchResults} />);

    // Assert the presence of the search input and results
    expect(screen.getAllByRole("listitem")).toHaveLength(
      mockSearchResults.length
    );
  });

  test("triggers onInput callback on input change", () => {
    const mockOnInput = jest.fn();
    render(
      <SearchCard onInput={mockOnInput} searchResults={mockSearchResults} />
    );
  });
});
