import React, {useEffect, useState} from 'react';
import './App.css';
import { Alien } from "./Alien";
import { useInterval } from "usehooks-ts";

const PAGE_SIZE = 20;

function App() {
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [count, setCount] = useState<number>(0);
  const [sortField, setSortField] = useState<number>(0);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);

  useInterval(() => {
    setTick(tick + 1);
  }, 1000);

  useEffect(() => {
    fetch('/api/wide')
      .then(response => response.json())
      .then(data => {
        console.log('data', data);
        setAliens(data.aliens);
        setTick(data.tick_count);
      });
  });

  if (!aliens || aliens.length == 0) {
    return (
      <div>Loading</div>
    );
  }
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

  return (
    <div className="App">
      <h3>Aliens: {aliens.length}</h3>
      <div>
        <button onClick={() => { setPageIndex(Math.max(0, pageIndex -1))}}>Page Down</button>
        {pageIndex} of {pageCount - 1}
        <button onClick={() => { setPageIndex(Math.min(pageIndex +1, pageCount-1))}}>Page Up</button>
      </div>
      <table>
        {alienHeader}
        {alienSummary}
      </table>
      <div>Tick: {tick}</div>
    </div>
  );
}

export default App;
