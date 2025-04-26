import { createContext, useReducer, ReactNode } from "react";
import { CounterpointContextProps, Note, Species } from "../types";
import { counterpointReducer, initialState } from "../reducers";

const CounterpointContext = createContext<CounterpointContextProps | undefined>(
  undefined
);

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

  const setPosition = (position: boolean) => {
    dispatch({ type: 'SET_COUNTERPOINT_POSITION', position })
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
    setPosition,
    addToHistory,
    undo
  };

  return (
    <CounterpointContext.Provider value={value}>
      {children}
    </CounterpointContext.Provider>
  );
}

export { CounterpointContext };
