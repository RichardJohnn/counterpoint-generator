import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import StatusBar from "../components/StatusBar";

describe("StatusBar", () => {
  it("renders without crashing", () => {
    render(<StatusBar />);
  });
});
