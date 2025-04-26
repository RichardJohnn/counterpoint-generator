import { CounterpointState, CounterpointAction } from "../types";

export const initialState: CounterpointState = {
  cantusFirmus: [],
  counterpoint: [],
  selectedSpecies: 1,
  isCounterpointAbove: true,
  history: [],
};

export function counterpointReducer(
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
    case "SET_COUNTERPOINT_POSITION":
      return {
        ...state,
        isCounterpointAbove: action.position,
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
