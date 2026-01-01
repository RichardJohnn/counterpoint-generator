import "@testing-library/jest-dom";
import "vitest-canvas-mock";
import { vi } from "vitest";

// Mock Tone.js
vi.mock("tone", () => ({
  start: vi.fn().mockResolvedValue(undefined),
  PolySynth: vi.fn().mockImplementation(() => ({
    toDestination: vi.fn().mockReturnThis(),
    set: vi.fn(),
    triggerAttackRelease: vi.fn(),
    releaseAll: vi.fn(),
  })),
  Synth: vi.fn(),
  Part: vi.fn().mockImplementation(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    dispose: vi.fn(),
  })),
  getTransport: vi.fn().mockReturnValue({
    bpm: { value: 60 },
    start: vi.fn(),
    stop: vi.fn(),
    cancel: vi.fn(),
    scheduleOnce: vi.fn(),
  }),
}));
