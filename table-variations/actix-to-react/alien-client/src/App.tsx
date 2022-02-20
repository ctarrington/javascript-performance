import React, {ChangeEvent, useEffect, useState} from "react";
import "./App.css";
import { useInterval } from "usehooks-ts";
import { Alien, FieldCriteria } from "./Alien";

const PAGE_SIZE = 20;
const PERIOD = 1;

function App() {
  const [aliens, setAliens] = useState<Alien[]>([]);
  const [sortField, setSortField] = useState<number>(-1);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [tick, setTick] = useState<number>(0);
  const [criteria, setCriteria] = useState<FieldCriteria[]>([]);

  const worker = new Worker('/fetch.worker.js');
  useInterval(() => {
    worker.postMessage('this is a test message to the worker');
    worker.addEventListener('message', message => {
      const {data} = message;
      setAliens(data.aliens);
      setTick(data.tick_count);
    });
  }, PERIOD * 1000);

  if (!aliens || aliens.length === 0) {
    return <div>Loading tick: {tick}</div>;
  }

  if (criteria.length === 0) {
    aliens[0].fields.forEach((field) =>
      criteria.push({ minimum: null, maximum: null })
    );
    setCriteria(criteria);
  }

  const filteredAliens = aliens.filter((alien) => {
    let invalidField = criteria.some((criterion, index) => {
      return (
        (criterion.minimum !== null &&
          alien.fields[index].value < criterion.minimum) ||
        (criterion.maximum !== null &&
          alien.fields[index].value > criterion.maximum)
      );
    });

    return !invalidField;
  });

  const sortedAliens =
    sortField >= 0
      ? filteredAliens.sort((alienA, alienB) => {
          return (
            alienA.fields[sortField].value - alienB.fields[sortField].value
          );
        })
      : filteredAliens;

  const minimumPageIndex = Math.max(
    0,
    Math.ceil(sortedAliens.length / PAGE_SIZE) - 1
  );
  if (pageIndex > minimumPageIndex) {
    setPageIndex(minimumPageIndex);
  }

  const restrictedAliens = [];
  for (
    let index = pageIndex * PAGE_SIZE;
    index < (pageIndex + 1) * PAGE_SIZE;
    index++
  ) {
    if (!sortedAliens[index]) {
      break;
    }
    restrictedAliens.push(sortedAliens[index]);
  }

  const headers = aliens[0].fields.map((field, index) => {
    return (
      <th key={index}>
        {" "}
        <div
          onClick={() => {
            setSortField(index);
          }}
        >
          {field.name}
        </div>{" "}
      </th>
    );
  });

  const alienHeader = (
    <tr>
      <th>ID </th>
      {headers}
    </tr>
  );
  const alienSummary = restrictedAliens.map((alien) => {
    const fields = alien.fields.map((field, index) => {
      return <td key={index}> {field.value.toFixed(4)} </td>;
    });
    return (
      <tr key={alien.id}>
        <td>{alien.id} </td>
        {fields}
      </tr>
    );
  });

  const minimums = aliens[0].fields.map((field, index) => {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      criteria[index].minimum = parseFloat(newValue);
      setCriteria(criteria);
    };
    return (
      <td key={index}>
        <input type="number" id={"minimum" + index} onChange={onChange} />
      </td>
    );
  });

  const minimumRow = (
    <tr>
      <td> </td>
      {minimums}
    </tr>
  );

  const maximums = aliens[0].fields.map((field, index) => {
    const onChange = (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      criteria[index].maximum = parseFloat(newValue);
      setCriteria(criteria);
    };
    return (
      <td key={index}>
        <input type="number" id={"maximum" + index} onChange={onChange} />
      </td>
    );
  });

  const maximumRow = (
    <tr>
      <td> </td>
      {maximums}
    </tr>
  );

  const pageCount = Math.max(1, Math.ceil(sortedAliens.length / PAGE_SIZE));

  return (
    <div className="App">
      <h3>Aliens: {aliens.length}</h3>
      <div>
        <button
          onClick={() => {
            setPageIndex(Math.max(0, pageIndex - 1));
          }}
        >
          Page Down
        </button>
        {pageIndex} of {pageCount - 1}
        <button
          onClick={() => {
            setPageIndex(Math.min(pageIndex + 1, pageCount - 1));
          }}
        >
          Page Up
        </button>
      </div>
      <table>
        <tbody>
          {alienHeader}
          {alienSummary}
          {minimumRow}
          {maximumRow}
        </tbody>
      </table>
      <div>Tick: {tick}</div>
    </div>
  );
}

export default App;
