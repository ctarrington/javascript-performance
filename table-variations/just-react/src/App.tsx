import React, { useState } from "react";
import "./App.css";
import { Alien } from "./Alien";
import { useInterval } from "usehooks-ts";

function App() {
  const [aliens, setAliens] = useState<Alien[]>([new Alien(1)]);
  const [count, setCount] = useState<number>(0);

  const alienSummary = aliens.map((alien) => {
    const fields = alien.fields.map((field, index) => {
      return <span key={index}> {field.value} </span>;
    });
    return <div key={alien.id}>{fields}</div>;
  });

  useInterval(() => {
    for (let alien of aliens) {
      alien.tick();
    }

    aliens.push(new Alien(aliens.length));

    setAliens(aliens);
    setCount(aliens.length);
  }, 1);

  return (
    <div className="App">
      {count} {alienSummary}
    </div>
  );
}

export default App;
