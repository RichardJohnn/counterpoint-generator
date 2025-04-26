export interface Note {
  pitch: string; // e.g., "C4"
  duration: number; // whole note = 1, half note = 0.5, etc.
  measure: number; // which measure the note belongs to
  position: number; // position within measure (0-based)
}

export type Species = 1 | 2 | 3 | 4 | 5;

export interface CounterpointState {
  cantusFirmus: Note[];
  counterpoint: Note[];
  selectedSpecies: Species;
  isCounterpointAbove: boolean;
  history: { cantusFirmus: Note[]; counterpoint: Note[] }[];
}

export type CounterpointAction =
  | { type: "SET_CANTUS_FIRMUS"; notes: Note[] }
  | { type: "SET_COUNTERPOINT"; notes: Note[] }
  | { type: "SET_SPECIES"; species: Species }
  | { type: "SET_COUNTERPOINT_POSITION"; position: boolean }
  | { type: "ADD_TO_HISTORY" }
  | { type: "UNDO" };

export interface CounterpointContextProps extends CounterpointState {
  setCantusFirmus: (notes: Note[]) => void;
  setCounterpoint: (notes: Note[]) => void;
  setSpecies: (species: Species) => void;
  setPosition: (isAbove: boolean) => void;
  addToHistory: () => void;
  undo: () => void;
}
