import React, { useState } from "react";
import "./App.css";
import { Alien } from "./Alien";
import { useInterval } from "usehooks-ts";

const PAGE_SIZE = 20;
const FIELD_COUNT = 50;
const ROW_MAX = 100*1000;
const ROW_INCREASE = 5*1000;

function App() {
  const [aliens, setAliens] = useState<Alien[]>([new Alien(0, FIELD_COUNT)]);
  const [count, setCount] = useState<number>(0);
  const [sortField, setSortField] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);

  const headers = aliens[0].fields.map((field, index) => {
    return <th> <a onClick={() => {setSortField(index)}}>{field.name}</a> </th>;
  });
  const alienHeader = (
    <tr>
      <th>ID </th>
      {headers}
    </tr>
  );

  const sortedAliens = aliens.sort((alienA, alienB) => {
    return alienA.fields[sortField].value - alienB.fields[sortField].value;
  })

  const restrictedAliens = [];
  for (let index=pageIndex*PAGE_SIZE; index < (pageIndex+1)*PAGE_SIZE; index++) {
    if (!sortedAliens[index]) {
      break;
    }
    restrictedAliens.push(sortedAliens[index]);
  }

  const alienSummary = restrictedAliens.map((alien) => {
    const fields = alien.fields.map((field, index) => {
      return <td key={index}> {field.value.toFixed(4)} </td>;
    });
    return <tr key={alien.id}>
      <td>{alien.id} </td>
      {fields}
    </tr>;
  });

  const pageCount = Math.ceil(aliens.length / PAGE_SIZE);

  useInterval(() => {
    setTick(tick + 1);

    for (let alien of aliens) {
      alien.tick();
    }

    if (aliens.length < ROW_MAX) {
      for (let index = 0; index < ROW_INCREASE; index++) {
        aliens.push(new Alien(aliens.length, FIELD_COUNT));
      }
    }

    setAliens(aliens);
    setCount(aliens.length);
  }, 1000);

  return (
    <div className="App">
      <h3>{count}</h3>
      <div>
        <button onClick={() => { setPageIndex(Math.max(0, pageIndex -1))}}>Page Down</button>
        {pageIndex} of {pageCount - 1}
        <button onClick={() => { setPageIndex(Math.min(pageIndex +1, pageCount))}}>Page Up</button>
      </div>
      <table>
        {alienHeader}
        {alienSummary}
      </table>
      <div>{tick}</div>
    </div>
  );
}

export default App;
