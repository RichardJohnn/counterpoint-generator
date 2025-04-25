import { createContext, useContext, ReactNode, useReducer } from "react";

export interface Note {
  pitch: string; // e.g., "C4"
  duration: number; // whole note = 1, half note = 0.5, etc.
  measure: number; // which measure the note belongs to
  position: number; // position within measure (0-based)
}

export type Species = 1 | 2 | 3 | 4 | 5;

interface CounterpointState {
  cantusFirmus: Note[];
  counterpoint: Note[];
  selectedSpecies: Species;
  history: { cantusFirmus: Note[]; counterpoint: Note[] }[];
}

type CounterpointAction =
  | { type: "SET_CANTUS_FIRMUS"; notes: Note[] }
  | { type: "SET_COUNTERPOINT"; notes: Note[] }
  | { type: "SET_SPECIES"; species: Species }
  | { type: "ADD_TO_HISTORY" }
  | { type: "UNDO" };

interface CounterpointContextProps extends CounterpointState {
  setCantusFirmus: (notes: Note[]) => void;
  setCounterpoint: (notes: Note[]) => void;
  setSpecies: (species: Species) => void;
  addToHistory: () => void;
  undo: () => void;
}

const initialState: CounterpointState = {
  cantusFirmus: [],
  counterpoint: [],
  selectedSpecies: 1,
  history: [],
};

const CounterpointContext = createContext<CounterpointContextProps | undefined>(
  undefined
);

function counterpointReducer(
  state: CounterpointState,
  action: CounterpointAction
): CounterpointState {
  switch (action.type) {
    case "SET_CANTUS_FIRMUS":
      return {
        ...state,
        cantusFirmus: action.notes,
      };
    case "SET_COUNTERPOINT":
      return {
        ...state,
        counterpoint: action.notes,
      };
    case "SET_SPECIES":
      return {
        ...state,
        selectedSpecies: action.species,
      };
    case "ADD_TO_HISTORY":
      return {
        ...state,
        history: [
          ...state.history,
          {
            cantusFirmus: [...state.cantusFirmus],
            counterpoint: [...state.counterpoint],
          },
        ],
      };
    case "UNDO": {
      if (state.history.length === 0) return state;

      const lastItem = state.history[state.history.length - 1];
      return {
        ...state,
        cantusFirmus: lastItem.cantusFirmus,
        counterpoint: lastItem.counterpoint,
        history: state.history.slice(0, -1),
      };
    }
    default:
      return state;
  }
}

export function CounterpointProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(counterpointReducer, initialState);

  const setCantusFirmus = (notes: Note[]) => {
    dispatch({ type: 'SET_CANTUS_FIRMUS', notes });
  };

  const setCounterpoint = (notes: Note[]) => {
    dispatch({ type: 'SET_COUNTERPOINT', notes })
  }

  const setSpecies = (species: Species) => {
    dispatch({ type: 'SET_SPECIES', species })
  }

  const addToHistory = () => {
    dispatch({ type: 'ADD_TO_HISTORY' });
  }

  const undo = () => {
    dispatch({ type: 'UNDO' })
  }

  const value = {
    ...state,
    setCantusFirmus,
    setCounterpoint,
    setSpecies,
    addToHistory,
    undo
  };

  return (
    <CounterpointContext.Provider value={value}>
      {children}
    </CounterpointContext.Provider>
  );
}

export function useCounterpoint() {
  const context = useContext(CounterpointContext)

  if (context === undefined) {
    throw new Error('useCounterpoint must be used within a CounterpointProvider')
  }

  return context;
}
