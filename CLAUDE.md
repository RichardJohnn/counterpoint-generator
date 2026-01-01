# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A web application for generating species counterpoint. Users input a cantus firmus on an interactive music staff and the app generates counterpoint in one of five species. Built with React, VexFlow for music notation, and Tone.js for audio playback.

## Commands

```bash
npm run dev          # Start development server
npm run build        # TypeScript compile + Vite build
npm run lint         # ESLint
npm run test         # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Architecture

### State Management
- **CounterpointContext** (`src/context/CounterpointContext.tsx`): React Context + useReducer pattern for global state
- **counterpointReducer** (`src/reducers/counterpointReducer.ts`): Handles actions for cantus firmus, counterpoint, species selection, position, and history/undo
- State shape: `{ cantusFirmus: Note[], counterpoint: Note[], selectedSpecies: 1-5, isCounterpointAbove: boolean, history: [] }`

### Key Types (`src/types/counterpoint.ts`)
- **Note**: `{ pitch: string, duration: "w"|"h"|"q"|"8"|"16"|"hd"|"qd" }` - pitch like "C4", duration as VexFlow codes
- **Species**: 1-5 representing traditional counterpoint species
- **Measure**: Contains array of Notes

### Music Rendering (`src/utils/musicStaffUtils.ts`)
- `renderMusicStaff()`: Main rendering function - draws two staves (treble/bass) with notes and connectors
- `renderMeasures()`: Renders individual measures with notes
- `renderNotes()`: Handles VexFlow Voice/Formatter for note placement
- `LAYOUT` constants: Padding, margins, staff distances for consistent positioning

### Music Theory (`src/utils/musicTheory.ts`)
- `createVexFlowNote()`: Converts app Note to VexFlow StaveNote
- `noteToNumber()`: Converts pitch string to numeric value for comparisons
- `organizeNotesIntoMeasures()`: Groups notes by time signature
- `validateCantusFirmus()`: Validates range (E2-F#5) and beginning/end same note rule

### Staff Interaction (`src/hooks/useStaffInteraction.ts`)
- Handles mouse events on staff for note input
- `calculatePitchFromYPosition()`: Maps Y coordinate to pitch based on clef
- Shows ghost note preview on hover
- Different clef references (treble/alto/tenor/bass) with middle line mappings

### Component Hierarchy
- `App` → `MainLayout` → `StaffContainer` → `MusicStaff`
- `ControlPanel`: Species selection and controls
- `MusicStaff`: VexFlow canvas rendering via `useVexFlowContext` hook

## Testing

Tests use Vitest with jsdom and vitest-canvas-mock (required for VexFlow canvas operations). Test files are in `src/tests/` and `src/**/tests/`.

Run a single test file:
```bash
npx vitest run src/tests/MusicStaff.test.tsx
```
