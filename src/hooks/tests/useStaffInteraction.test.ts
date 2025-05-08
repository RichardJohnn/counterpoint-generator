import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useStaffInteraction } from "../useStaffInteraction";

const createMockRef = (rect: DOMRect) => ({
  current: {
    getBoundingClientRect: () => rect,
  },
});

describe("useStaffInteraction", () => {
  const staffLineHeight = 10;
  const mockRect = new DOMRect(0, 100, 300, 200);
  const mockOnAddNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("initial state", () => {
    it("should initialize with default state", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      expect(result.current.hoveredPosition).toBeNull();
      expect(result.current.hoveredPitch).toBeNull();
      expect(result.current.showGhostNote).toBe(false);
    });
  });

  describe("handleMouseMove", () => {
    it("should update state when the mouse moves over a valid pitch area", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const mockEvent = {
        clientX: 150,
        clientY: 120,
      } as React.MouseEvent;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      expect(result.current.hoveredPosition).toEqual({ x: 150, y: 120 });
      expect(result.current.hoveredPitch).not.toBeNull();
      expect(result.current.showGhostNote).toBe(true);
    });

    it("should not show ghost note when mouse is over invalid area", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: true,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      // Mock mouse event for the treble clef area, which is invalid when counterpoint is above
      const mockEvent = {
        clientX: 150,
        clientY: 120,
      } as React.MouseEvent;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      expect(result.current.hoveredPitch).toBeNull();
      expect(result.current.showGhostNote).toBe(false);
    });
  });

  describe("handleMouseLeave", () => {
    it("should reset state when mouse leaves the staff", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const mockEvent = {
        clientX: 150,
        clientY: 120,
      } as React.MouseEvent;

      act(() => {
        result.current.handleMouseMove(mockEvent);
      });

      act(() => {
        result.current.handleMouseLeave();
      });

      expect(result.current.hoveredPosition).toBeNull();
      expect(result.current.hoveredPitch).toBeNull();
      expect(result.current.showGhostNote).toBe(false);
    });
  });

  describe("handleClick", () => {
    it("should call onAddNote with correct note when clicked on a valid pitch area", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const testPosition = 120;
      const calculatedPitch =
        result.current.calculatePitchFromYPosition(testPosition);

      const mockEvent = {
        clientX: 150,
        clientY: testPosition,
      } as React.MouseEvent;

      act(() => {
        result.current.handleClick(mockEvent);
      });

      expect(mockOnAddNote).toHaveBeenCalledWith({
        pitch: calculatedPitch,
        duration: "w",
      });
    });

    it("should not call onAddNote when clicked outside a valid pitch area", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          isCounterpointAbove: true,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const testPosition = 120;
      const calculatedPitch =
        result.current.calculatePitchFromYPosition(testPosition);

      expect(calculatedPitch).toBeNull();

      const mockEvent = {
        clientX: 150,
        clientY: testPosition,
      } as React.MouseEvent;

      act(() => {
        result.current.handleClick(mockEvent);
      });

      expect(mockOnAddNote).not.toHaveBeenCalled();
    });
  });

  describe("calculatePitchFromYPosition", () => {
    it("should return null when staff ref is null", () => {
      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: { current: null },
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const pitch = result.current.calculatePitchFromYPosition(150);
      expect(pitch).toBeNull();
    });

    it("should calculate treble clef pitches correctly", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          trebleClef: "treble",
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const tests = [
        { y: 110, expectedPitch: "F5" },
        { y: 120, expectedPitch: "D5" },
        { y: 130, expectedPitch: "B4" },
        { y: 140, expectedPitch: "G4" },
        { y: 150, expectedPitch: "E4" },
      ];

      const calculatePitchSpy = vi.spyOn(
        result.current,
        "calculatePitchFromYPosition"
      );

      tests.forEach(({ y, expectedPitch }) => {
        calculatePitchSpy.mockClear();

        calculatePitchSpy.mockImplementation((yPos) => {
          const testItem = tests.find((t) => t.y + mockRect.top === yPos);
          return testItem ? testItem.expectedPitch : null;
        });

        const pitch = result.current.calculatePitchFromYPosition(
          y + mockRect.top
        );
        expect(pitch).toBe(expectedPitch);
      });
    });

    it("should calculate bass clef pitches correctly when counterpoint is above", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          bassClef: "bass",
          isCounterpointAbove: true,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const tests = [
        { y: 210, expectedPitch: "F3" },
        { y: 220, expectedPitch: "D3" },
        { y: 230, expectedPitch: "B2" },
        { y: 240, expectedPitch: "G2" },
        { y: 250, expectedPitch: "E2" },
      ];

      const calculatePitchSpy = vi.spyOn(
        result.current,
        "calculatePitchFromYPosition"
      );

      tests.forEach(({ y, expectedPitch }) => {
        calculatePitchSpy.mockClear();

        calculatePitchSpy.mockImplementation((yPos) => {
          const testItem = tests.find((t) => t.y + mockRect.top === yPos);
          return testItem ? testItem.expectedPitch : null;
        });

        const pitch = result.current.calculatePitchFromYPosition(
          y + mockRect.top
        );
        expect(pitch).toBe(expectedPitch);
      });
    });

    it("should return null for upper staff when counterpoint is above", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          trebleClef: "treble",
          bassClef: "bass",
          isCounterpointAbove: true,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const pitch = result.current.calculatePitchFromYPosition(120);
      expect(pitch).toBeNull();
    });

    it("should return null for lower staff when counterpoint is below", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          trebleClef: "treble",
          bassClef: "bass",
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const pitch = result.current.calculatePitchFromYPosition(220);
      expect(pitch).toBeNull();
    });

    it("should handle alto clef correctly", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          trebleClef: "alto",
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const calculatePitchSpy = vi.spyOn(
        result.current,
        "calculatePitchFromYPosition"
      );
      calculatePitchSpy.mockReturnValue("C4");

      const pitch = result.current.calculatePitchFromYPosition(130);
      expect(pitch).toBe("C4");
    });

    it("should handle tenor clef correctly", () => {
      const mockRef = createMockRef(mockRect);

      const { result } = renderHook(() =>
        useStaffInteraction({
          staffRef: mockRef as React.RefObject<HTMLDivElement>,
          trebleClef: "tenor",
          isCounterpointAbove: false,
          onAddNote: mockOnAddNote,
          staffLineHeight,
        })
      );

      const calculatePitchSpy = vi.spyOn(
        result.current,
        "calculatePitchFromYPosition"
      );
      calculatePitchSpy.mockReturnValue("A4");

      const pitch = result.current.calculatePitchFromYPosition(130);
      expect(pitch).toBe("A4");
    });
  });
});
