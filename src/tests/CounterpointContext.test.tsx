import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CounterpointProvider } from "../context";
import { useCounterpoint } from "../hooks";
import { Note, Species } from "../types";

const TestComponent = () => {
  const {
    cantusFirmus,
    counterpoint,
    selectedSpecies,
    isCounterpointAbove,
    history,
    setCantusFirmus,
    setCounterpoint,
    setSpecies,
    setPosition,
    addToHistory,
    undo,
  } = useCounterpoint();

  const createNote = (pitch: string, measure: number): Note => ({
    pitch,
    duration: 1,
    measure,
    position: 0,
  });

  return (
    <div>
      <div data-testid="cantus-firmus">{JSON.stringify(cantusFirmus)}</div>
      <div data-testid="counterpoint">{JSON.stringify(counterpoint)}</div>
      <div data-testid="species">{selectedSpecies}</div>
      <div data-testid="position">{JSON.stringify(isCounterpointAbove)}</div>
      <div data-testid="history-length">{history.length}</div>

      <button
        data-testid="set-cantus-firmus"
        onClick={() =>
          setCantusFirmus([createNote("C4", 1), createNote("D4", 2)])
        }
      >
        Set Cantus Firmus
      </button>
      <button
        data-testid="set-different-cantus"
        onClick={() =>
          setCantusFirmus([createNote("E4", 1), createNote("D4", 2)])
        }
      >
        Set a Different Cantus Firmus
      </button>
      <button
        data-testid="set-counterpoint"
        onClick={() =>
          setCounterpoint([createNote("G4", 1), createNote("F4", 2)])
        }
      >
        Set Counterpoint
      </button>
      <button
        data-testid="set-species"
        onClick={() => setSpecies(2 as Species)}
      >
        Set Species to 2
      </button>
      <button
        data-testid="set-position"
        onClick={() => setPosition(false)}
      >
        Set Counterpoint Position
      </button>
      <button data-testid="add-to-history" onClick={addToHistory}>
        Add To History
      </button>
      <button data-testid="undo" onClick={undo}>
        Undo
      </button>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <CounterpointProvider>
      <TestComponent />
    </CounterpointProvider>
  );
};

describe("CounterpointContext", () => {
  beforeEach(() => {
    renderWithProvider();
  });

  it("should initialize with default values", () => {
    expect(screen.getByTestId("cantus-firmus")).toHaveTextContent("[]");
    expect(screen.getByTestId("counterpoint")).toHaveTextContent("[]");
    expect(screen.getByTestId("species")).toHaveTextContent("1");
    expect(screen.getByTestId("position")).toHaveTextContent("true");
    expect(screen.getByTestId("history-length")).toHaveTextContent("0");
  });

  it("should update cantus firmus", () => {
    fireEvent.click(screen.getByTestId("set-cantus-firmus"));

    const cantusFirmusJson = JSON.parse(
      screen.getByTestId("cantus-firmus").textContent || "[]"
    );
    expect(cantusFirmusJson).toHaveLength(2);
    expect(cantusFirmusJson[0].pitch).toBe("C4");
    expect(cantusFirmusJson[1].pitch).toBe("D4");
  });

  it("should update counterpoint", () => {
    fireEvent.click(screen.getByTestId("set-counterpoint"));

    const counterpointJson = JSON.parse(
      screen.getByTestId("counterpoint").textContent || "[]"
    );
    expect(counterpointJson).toHaveLength(2);
    expect(counterpointJson[0].pitch).toBe("G4");
    expect(counterpointJson[1].pitch).toBe("F4");
  });

  it("should update species", () => {
    fireEvent.click(screen.getByTestId("set-species"));

    expect(screen.getByTestId("species")).toHaveTextContent("2");
  });

  it("should update counterpoint position", () => {
    fireEvent.click(screen.getByTestId("set-position"));

    expect(screen.getByTestId("position")).toHaveTextContent("false");
  })

  it("should add to history", () => {
    fireEvent.click(screen.getByTestId("set-cantus-firmus"));
    fireEvent.click(screen.getByTestId("set-counterpoint"));
    fireEvent.click(screen.getByTestId("add-to-history"));

    expect(screen.getByTestId("history-length")).toHaveTextContent("1");
  });

  it("should undo changes", () => {
    fireEvent.click(screen.getByTestId("set-cantus-firmus"));
    fireEvent.click(screen.getByTestId("set-counterpoint"));
    fireEvent.click(screen.getByTestId("add-to-history"));

    fireEvent.click(screen.getByTestId("set-different-cantus"));

    let cantusFirmusJson = JSON.parse(screen.getByTestId("cantus-firmus").textContent || "[]");
    expect(cantusFirmusJson[0].pitch).toBe("E4");

    fireEvent.click(screen.getByTestId("undo"));

    cantusFirmusJson = JSON.parse(screen.getByTestId("cantus-firmus").textContent || "[]");
    expect(cantusFirmusJson).toHaveLength(2);
    expect(cantusFirmusJson[0].pitch).toBe("C4");
  });
});
