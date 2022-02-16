import React, { useState } from "react";
import "./App.css";
import { Alien } from "./Alien";
import { useInterval } from "usehooks-ts";

const FIELD_COUNT = 10;
const ROW_INCREASE = 100;

function App() {
  const [aliens, setAliens] = useState<Alien[]>([new Alien(1, FIELD_COUNT)]);
  const [count, setCount] = useState<number>(0);

  const headers = aliens[0].fields.map((field, index) => {
    return <th> {field.name} </th>;
  });
  const alienHeader = (
    <tr>
      <th>ID </th>
      {headers}
    </tr>
  );

  const alienSummary = aliens.map((alien) => {
    const fields = alien.fields.map((field, index) => {
      return <td key={index}> {field.value.toFixed(4)} </td>;
    });
    return <tr key={alien.id}>
      <td>{alien.id} </td>
      {fields}
    </tr>;
  });

  useInterval(() => {
    for (let alien of aliens) {
      alien.tick();
    }

    for (let index = 0; index<ROW_INCREASE; index++) {
      aliens.push(new Alien(aliens.length, FIELD_COUNT));
    }

    setAliens(aliens);
    setCount(aliens.length);
  }, 1000);

  return (
    <div className="App">
      <h3>{count}</h3>
      <table>
      {alienHeader}
      {alienSummary}
      </table>
    </div>
  );
}

export default App;
