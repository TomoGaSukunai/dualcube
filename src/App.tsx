import { useState } from 'react';
import './App.css';
import DualCubeCanvas from './DualCubeCanvas';


function App() {
  const [press, setPress] = useState<boolean>(false);
  return (
    <>
      <DualCubeCanvas />
      <button onClick={() => setPress(!press)}>
        press
      </button>
    </>
  );
}

export default App;
