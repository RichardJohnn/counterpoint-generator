# Species Counterpoint Web App - Implementation Checklist

## Phase 1: Project Setup and Core Infrastructure

### Project Initialization
- [x] Initialize React project (Create React App or Vite)
- [x] Set up project structure (components, utils, hooks, tests, types folders)
- [x] Install essential dependencies:
  - [x] vexflow
  - [x] tone.js
  - [x] react-dnd and react-dnd-html5-backend
  - [x] vitest and testing-library
- [x] Create base App component with header
- [ ] Set up initial test for App component

### Core State Management
- [ ] Create CounterpointContext.tsx
  - [ ] Define types for cantus firmus notes, counterpoint notes, and history
  - [ ] Implement context provider component
  - [ ] Set up state for cantus firmus, counterpoint, species, and history
  - [ ] Add basic state update functions
- [ ] Update App.tsx to use context provider
- [ ] Create tests for context functionality

### Basic UI Layout
- [ ] Create MainLayout component
- [ ] Create ControlPanel component
  - [ ] Add species selection dropdown (1-5)
  - [ ] Add placeholder buttons for playback and reset
  - [ ] Add toggle for counterpoint placement (above/below)
- [ ] Create StaffContainer component (placeholder)
- [ ] Create StatusBar component
- [ ] Style all components with CSS
- [ ] Write tests for each component

## Phase 2: Musical Staff Rendering

### VexFlow Integration
- [ ] Create MusicStaff component
  - [ ] Add props for clef type and staff width
  - [ ] Implement VexFlow rendering
  - [ ] Add support for multiple measures
  - [ ] Add time and key signature support
- [ ] Update StaffContainer to use MusicStaff
- [ ] Create useVexFlowContext hook for VexFlow initialization
- [ ] Add resizing support
- [ ] Write tests for MusicStaff rendering

### Rendering Notes on the Staff
- [ ] Update MusicStaff to accept note array
- [ ] Add note rendering functionality
  - [ ] Position notes correctly on staff
  - [ ] Handle different durations
  - [ ] Add bar lines between measures
- [ ] Create musicTheory.ts utility
  - [ ] Add note name to VexFlow conversion
  - [ ] Add note range validation
  - [ ] Add note positioning helpers
- [ ] Add tests for note rendering

### Basic Staff Interaction
- [ ] Enhance MusicStaff for click interaction
  - [ ] Add click detection
  - [ ] Calculate note position from click
  - [ ] Add hover feedback
  - [ ] Add ghost note preview
- [ ] Create useStaffInteraction hook
  - [ ] Add state for interaction
  - [ ] Add click and hover handlers
  - [ ] Add coordinate to note conversion
- [ ] Update CounterpointContext with note adding method
- [ ] Connect staff clicks to context
- [ ] Add tests for staff interaction

## Phase 3: Cantus Firmus Input

### Cantus Firmus Input Interface
- [ ] Create CantusInput component
  - [ ] Add controls for adding/removing notes
  - [ ] Display current cantus firmus
  - [ ] Add position selection
- [ ] Add cantus firmus validation
  - [ ] Check octave range
  - [ ] Validate beginning and end
  - [ ] Check for illegal intervals
- [ ] Expand musicTheory.ts
  - [ ] Add validateCantusNote function
  - [ ] Add analyzeCantus function
  - [ ] Add suggestNextNotes function
- [ ] Add visual feedback for rule violations
- [ ] Write tests for cantus input and validation

### Clef Selection and Mode Detection
- [ ] Update ControlPanel with clef selector
- [ ] Connect clef selection to context
- [ ] Add mode detection to musicTheory.ts
  - [ ] Analyze cantus firmus notes
  - [ ] Determine likely mode
  - [ ] Identify tonic note
- [ ] Create component to display mode and tonic
- [ ] Update MusicStaff for clef changes
- [ ] Add key signature based on detected mode
- [ ] Write tests for clef selection and mode detection

### Cantus Firmus Validation and Refinement
- [ ] Create CantusValidator component
  - [ ] Add comprehensive rule checking
  - [ ] Add specific feedback
  - [ ] Add melody improvement suggestions
- [ ] Expand musicTheory.ts
  - [ ] Add checkMelodicRange function
  - [ ] Add checkMelodicIntervals function
  - [ ] Add checkCadentialFigures function
- [ ] Add visual analysis representation
  - [ ] Color code notes by strength
  - [ ] Highlight problems
  - [ ] Display suggestions
- [ ] Create CantusRefinement component
  - [ ] Add note selection and modification
  - [ ] Add alternative note suggestions
  - [ ] Show impact of changes
- [ ] Write tests for validation and refinement

## Phase 4: Counterpoint Generation (Basic)

### First Species Counterpoint Algorithm
- [ ] Create counterpoint.ts utility
  - [ ] Implement generateFirstSpecies function
  - [ ] Add position parameter (above/below)
- [ ] Implement core counterpoint rules
  - [ ] Avoid parallel fifths and octaves
  - [ ] Maintain proper voice leading
  - [ ] Create proper cadence
- [ ] Add utility functions
  - [ ] findValidCounterpointNote
  - [ ] checkCounterpointRules
  - [ ] analyzePotentialVoiceLeading
- [ ] Create test suite for counterpoint generation
- [ ] Ensure algorithm handles different modes and clefs

### Counterpoint Rendering and UI Integration
- [ ] Update MusicStaff for counterpoint
  - [ ] Accept cantus and counterpoint notes
  - [ ] Render in different colors/staves
  - [ ] Show note relationships
- [ ] Create CounterpointControls component
  - [ ] Add generate button
  - [ ] Add position selector
  - [ ] Add reset button
- [ ] Update CounterpointContext
  - [ ] Store generated counterpoint
  - [ ] Track counterpoint position
  - [ ] Add generation method
- [ ] Connect all UI elements
- [ ] Add visual feedback during generation
- [ ] Write tests for counterpoint rendering and controls

### Counterpoint Rule Validation
- [ ] Create CounterpointValidator component
  - [ ] Add counterpoint analysis
  - [ ] Identify rule violations
  - [ ] Provide specific feedback
- [ ] Expand counterpoint.ts
  - [ ] Add checkParallelFifthsAndOctaves function
  - [ ] Add checkVoiceLeading function
  - [ ] Add checkCounterpointMelody function
  - [ ] Add checkHarmony function
- [ ] Add visual feedback for violations
  - [ ] Highlight problem pairs
  - [ ] Show explanations
  - [ ] Suggest corrections
- [ ] Update CounterpointContext for validation
- [ ] Write tests for rule validation

## Phase 5: User Interaction Enhancements

### Note Manipulation with Drag and Drop
- [ ] Set up React DnD
  - [ ] Add DnD provider
  - [ ] Define drag sources and drop targets
- [ ] Create DraggableNote component
  - [ ] Make notes draggable
  - [ ] Add drag feedback
  - [ ] Add range restrictions
- [ ] Update MusicStaff for drag and drop
  - [ ] Use DraggableNote component
  - [ ] Define drop zones
  - [ ] Update state on note movement
- [ ] Connect to CounterpointContext
  - [ ] Update note positions
  - [ ] Trigger revalidation
  - [ ] Update visual feedback
- [ ] Write tests for note dragging

### Audio Playback with Tone.js
- [ ] Create audio.ts utility
  - [ ] Add initializeTone function
  - [ ] Add playNote function
  - [ ] Add playSequence function
- [ ] Create PlaybackControls component
  - [ ] Add play/pause/stop buttons
  - [ ] Add tempo slider
  - [ ] Add part selection (cantus/counterpoint/both)
- [ ] Integrate with Tone.js
  - [ ] Convert notes to Tone.js format
  - [ ] Create piano synth
  - [ ] Handle timing
- [ ] Add visual feedback during playback
  - [ ] Highlight playing notes
  - [ ] Show progress
  - [ ] Indicate active playback
- [ ] Write tests for audio playback

### History Tracking and Undo/Redo
- [ ] Enhance CounterpointContext for history
  - [ ] Track state history
  - [ ] Add undo/redo functions
  - [ ] Add snapshot saving
- [ ] Create HistoryControls component
  - [ ] Add undo/redo buttons
  - [ ] Add history timeline
  - [ ] Add state jumping
- [ ] Update state management for history
  - [ ] Record meaningful changes
  - [ ] Store complete state
  - [ ] Limit history length
- [ ] Add version comparison feature
  - [ ] Create side-by-side view
  - [ ] Highlight differences
  - [ ] Add merge option
- [ ] Write tests for history functionality

## Phase 6: Additional Species Implementation

### Second Species Counterpoint
- [ ] Enhance counterpoint.ts
  - [ ] Add generateSecondSpecies function
  - [ ] Implement second species rules
  - [ ] Handle passing and neighbor tones
- [ ] Update MusicStaff
  - [ ] Add half note rendering
  - [ ] Fix cantus/counterpoint alignment
  - [ ] Handle measure divisions
- [ ] Update CounterpointControls
  - [ ] Add species selection
  - [ ] Update UI for selected species
  - [ ] Add species guidance
- [ ] Expand validation system
  - [ ] Add second species rules
  - [ ] Check dissonance treatment
  - [ ] Validate passing/neighbor tones
- [ ] Write tests for second species

### Third and Fourth Species Counterpoint
- [ ] Enhance counterpoint.ts
  - [ ] Add generateThirdSpecies function (4:1)
  - [ ] Add generateFourthSpecies function (syncopated)
  - [ ] Implement species-specific rules
- [ ] Update MusicStaff
  - [ ] Add quarter note rendering
  - [ ] Add syncopation support
  - [ ] Add note ties
- [ ] Expand validation system
  - [ ] Add species-specific validations
  - [ ] Check rhythmic relationships
  - [ ] Validate suspensions
- [ ] Update UI
  - [ ] Add species guidance
  - [ ] Add suspension visualization
  - [ ] Highlight rhythmic patterns
- [ ] Write tests for third and fourth species

### Fifth Species Counterpoint and Combined View
- [ ] Enhance counterpoint.ts
  - [ ] Add generateFifthSpecies function (florid)
  - [ ] Combine elements from all species
  - [ ] Add rhythmic variety support
- [ ] Create SpeciesComparisonView component
  - [ ] Add side-by-side species display
  - [ ] Add difference highlighting
  - [ ] Add species toggling
- [ ] Update MusicStaff
  - [ ] Add mixed duration support
  - [ ] Add ornament rendering
  - [ ] Fix complex rhythmic alignment
- [ ] Expand validation system
  - [ ] Add fifth species validations
  - [ ] Check element mixture
  - [ ] Validate musical coherence
- [ ] Write tests for fifth species and comparison view

## Phase 7: Export and Sharing

### MusicXML Export
- [ ] Create musicxml.ts utility
  - [ ] Add generateMusicXML function
  - [ ] Add formatMusicXML function
- [ ] Create ExportControls component
  - [ ] Add export button
  - [ ] Add export options
  - [ ] Add success feedback
- [ ] Implement download functionality
  - [ ] Create downloadable file
  - [ ] Add proper file naming
  - [ ] Handle browser differences
- [ ] Add export error handling
  - [ ] Add pre-export validation
  - [ ] Add error messages
  - [ ] Add fix suggestions
- [ ] Write tests for MusicXML export

### URL Sharing and State Persistence
- [ ] Create URL encoding system
  - [ ] Serialize app state
  - [ ] Include essential settings
  - [ ] Generate shareable URL
- [ ] Create ShareControls component
  - [ ] Add URL generation
  - [ ] Add copy button
  - [ ] Add QR code display
- [ ] Implement URL state loading
  - [ ] Parse URL parameters
  - [ ] Reconstruct state
  - [ ] Restore settings
- [ ] Add localStorage persistence
  - [ ] Save work in progress
  - [ ] Add session recovery
  - [ ] Add multiple composition management
- [ ] Write tests for sharing and persistence

### Final UI Refinements and Integration
- [ ] Create unified interface
  - [ ] Ensure consistent design
  - [ ] Add intuitive navigation
  - [ ] Make layout responsive
- [ ] Add instructional elements
  - [ ] Add help tooltips
  - [ ] Create tutorial mode
  - [ ] Add rule explanations
- [ ] Implement keyboard shortcuts
  - [ ] Add action shortcuts
  - [ ] Add navigation shortcuts
  - [ ] Ensure accessibility
- [ ] Add final polish
  - [ ] Add smooth animations
  - [ ] Add loading indicators
  - [ ] Improve error handling
- [ ] Conduct comprehensive testing
  - [ ] Test end-to-end flows
  - [ ] Check cross-browser compatibility
  - [ ] Test performance