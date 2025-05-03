import { render } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import MusicStaff from "../components/MusicStaff";
import * as hooks from "../hooks";
import * as utils from "../utils";

vi.mock("../hooks", async () => {
  const actual = await vi.importActual("../hooks");
  return {
    ...actual,
    useVexFlowContext: vi.fn().mockReturnValue({
      containerRef: { current: document.createElement("div") },
      initialize: vi.fn(),
      getContext: vi.fn().mockReturnValue({}),
    }),
  };
});

vi.mock("../utils", async () => {
  const actual = await vi.importActual("../utils");
  return {
    ...actual,
    drawStaves: vi.fn(),
  };
});

vi.mock("vexflow", () => {
  return {
    Renderer: vi.fn().mockImplementation(() => ({
      resize: vi.fn(),
      getContext: vi.fn().mockReturnValue({ clear: vi.fn() }),
    })),
    Stave: vi.fn().mockImplementation(() => ({
      addClef: vi.fn().mockReturnThis(),
      addTimeSignature: vi.fn().mockReturnThis(),
      setContext: vi.fn().mockReturnThis(),
      draw: vi.fn(),
    })),
  };
});

describe("Music Staff Component", () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;

  beforeEach(() => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: 1024,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: 768,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      value: originalInnerWidth,
    });
    Object.defineProperty(window, "innerHeight", {
      writable: true,
      value: originalInnerHeight,
    });
  });

  it("renders without crashing", () => {
    render(<MusicStaff />);
    expect(hooks.useVexFlowContext).toHaveBeenCalled();
  });

  it("initializes with default props", () => {
    render(<MusicStaff />);

    expect(utils.drawStaves).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        trebleClef: "treble",
        bassClef: "bass",
        timeSignature: "C",
      })
    );
  });

  it("uses custom props when provided", () => {
    render(
      <MusicStaff
        trebleClef="alto"
        bassClef="tenor"
        timeSignature="4/4"
        staffDistance={200}
      />
    );

    expect(utils.drawStaves).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        trebleClef: "alto",
        bassClef: "tenor",
        timeSignature: "4/4",
        staffDistance: 200,
      })
    );
  });

  it("responds to window resize events", () => {
    render(<MusicStaff />);

    vi.clearAllMocks();

    window.innerWidth = 500;
    window.innerHeight = 400;
    window.dispatchEvent(new Event("resize"));

    expect(utils.drawStaves).toHaveBeenCalled();
  });
});
