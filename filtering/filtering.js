

const results = [];

results.push(simpleFiltering(10*1000, false));
results.push(simpleFiltering(100*1000, false));
results.push(simpleFiltering(1000*1000,false));

results.push(simpleFiltering(10*1000, true));
results.push(simpleFiltering(100*1000, true));
results.push(simpleFiltering(1000*1000, true));
results.push(simpleFiltering(10*1000*1000, true));


console.log('results', results);
