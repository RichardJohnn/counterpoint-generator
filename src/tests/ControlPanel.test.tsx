import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CounterpointProvider } from "../context";
import ControlPanel from "../components/ControlPanel";

function renderWithContext(ui: React.ReactElement) {
  return render(<CounterpointProvider>{ui}</CounterpointProvider>);
}

describe("ControlPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    renderWithContext(<ControlPanel />);
  });

  it("renders species dropdown", () => {
    renderWithContext(<ControlPanel />);

    expect(screen.getByLabelText("Species")).toBeDefined();
  });

  it("calls onPlay when play button is clicked", () => {
    const mockPlay = vi.fn();
    renderWithContext(<ControlPanel onPlay={mockPlay} />);

    fireEvent.click(screen.getByText("Play"));
    expect(mockPlay).toHaveBeenCalled();
  });

  it("toggles play/stop button", () => {
    const mockOnPlay = vi.fn();
    const mockOnStop = vi.fn();

    renderWithContext(<ControlPanel onPlay={mockOnPlay} onStop={mockOnStop} />);

    const playButton = screen.getByText("Play");
    expect(playButton).toBeDefined();

    fireEvent.click(playButton);
    expect(mockOnPlay).toHaveBeenCalled();

    const stopButton = screen.getByText("Stop");
    expect(stopButton).toBeDefined();

    fireEvent.click(stopButton);
    expect(mockOnStop).toHaveBeenCalled();
  });

  it("calls onReset when reset button is clicked", () => {
    const mockOnReset = vi.fn();
    renderWithContext(<ControlPanel onReset={mockOnReset} />);

    fireEvent.click(screen.getByText("Reset"));
    expect(mockOnReset).toHaveBeenCalled();
  });

  it("renders undo button disabled when history is empty", () => {
    renderWithContext(<ControlPanel />);

    const undoButton = screen.getByText("Undo");
    expect(undoButton).toBeDefined();
    expect(undoButton.closest("button")).toHaveAttribute("disabled");
  });
});
