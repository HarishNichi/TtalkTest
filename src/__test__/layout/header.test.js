import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Header from "../../components/Layout/header";

describe("Header", () => {
  test("renders logo and toggle menu", () => {
    render(<Header />);

    // Verify logo is rendered
    const logo = screen.getByAltText("Ptalk logo");
    expect(logo).toBeInTheDocument();

    // Verify toggle menu is hidden initially
    const toggleMenu = screen.queryByTestId("toggle-menu");
    expect(toggleMenu).not.toBeInTheDocument();
  });
});
