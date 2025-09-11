import "./App.css";
import { HlsPlayer } from "./HlsPlayer.tsx";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(2);

  return (
    <div>
      <div className="players">
        {Array.from({ length: count }).map(() => (
          <HlsPlayer source="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
        ))}
      </div>
      <button onClick={() => setCount(count + 1)}>Add Player</button>
    </div>
  );
}

export default App;
