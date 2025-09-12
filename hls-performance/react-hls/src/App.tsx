import "./App.css";
import { HlsPlayer } from "./HlsPlayer.tsx";
import { useCallback, useState } from "react";

const DEFAULT_SOURCE = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

function App() {
  const [nextSource, setNextSource] = useState<string>(DEFAULT_SOURCE);
  const [sources, setSources] = useState<string[]>([]);

  const addPlayer = useCallback(() => {
    setSources((prev) => [...prev, nextSource]);
    setNextSource(DEFAULT_SOURCE);
  }, [nextSource, setNextSource, sources, setSources]);

  return (
    <div>
      <input
        type="text"
        value={nextSource}
        onChange={(e) => setNextSource(e.target.value)}
      />
      <button onClick={addPlayer}>Add Player</button> {sources.length}
      <div className="players">
        {sources.map((value: string, index) => (
          <HlsPlayer key={index} source={value} />
        ))}
      </div>
    </div>
  );
}

export default App;
