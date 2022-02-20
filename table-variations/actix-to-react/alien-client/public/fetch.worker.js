addEventListener('message', (message) => {
  fetch("/api/wide")
    .then((response) => response.json())
    .then((data) => {
      postMessage(data);
    });
});
