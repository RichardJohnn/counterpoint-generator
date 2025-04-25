import "./App.css"
import { CounterpointProvider } from "./context/CounterpointContext";

function App() {
  return (
    <CounterpointProvider>
      <h1>Species Counterpoint Generator</h1>
    </CounterpointProvider>
  );
}


export default App;
