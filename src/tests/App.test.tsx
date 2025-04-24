import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "../App";

describe("App component", () => {
  it("renders without crashing and shows expected content", () => {
    render(<App />);

    expect(
      screen.getByText("Species Counterpoint Generator")
    ).toBeInTheDocument();
  });
});
