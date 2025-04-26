import { useContext } from "react";
import { CounterpointContext } from "../context";
import { CounterpointContextProps } from "../types";

export function useCounterpoint(): CounterpointContextProps {
  const context = useContext(CounterpointContext);

  if (context === undefined) {
    throw new Error(
      "useCounterpoint must be used within a CounterpointProvider"
    );
  }

  return context;
}
