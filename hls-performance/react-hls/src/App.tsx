import "./App.css";
import { HlsPlayer } from "./HlsPlayer.tsx";
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  const playerIndexes = Array.from({ length: count }) as number[];

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>Add Player</button> {count}
      <div className="players">
        {playerIndexes.map((value: number) => (
          <HlsPlayer
            key={value}
            source="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
