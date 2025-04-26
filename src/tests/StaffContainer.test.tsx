import { describe, it } from "vitest";
import { render } from "@testing-library/react";
import { CounterpointProvider } from "../context";
import StaffContainer from "../components/StaffContainer";

describe("StaffContainer", () => {
  it("renders without crashing", () => {
    render(
      <CounterpointProvider>
        <StaffContainer />
      </CounterpointProvider>
    );
  });
});
