import './App.css'
import {HlsPlayer} from "./HlsPlayer.tsx";

function App() {

  return (
    <>
      <h1>React and HLS</h1>
        <div>
            <HlsPlayer source="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
            <HlsPlayer source="https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8" />
        </div>
    </>
  )
}

export default App
