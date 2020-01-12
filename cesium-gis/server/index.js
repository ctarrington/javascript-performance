const express = require('express')
const app = express()

const http = require('http').Server(app);
const io = require('socket.io')(http);

const PORT = 3001;

app.use(express.static('public'));

io.on('connection', function(socket){
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


http.listen(PORT, function(){
    console.log('listening on *:'+PORT);
});


const initializeData = () => {
    const initialLat = 25;
    const initialLon = -80;
    const deltaRange = 0.05;

    const context = {
        data: [],
        deltaLats:[],
        deltaLons: [],
        currentId: 0,
    };

  const tick = () => {

      context.data.forEach((track, index) => {
         track.lat += context.deltaLats[index];
         track.lon += context.deltaLons[index];
      });

      context.data.push({
          id: context.currentId++,
          lon: initialLon,
          lat: initialLat,
      });


      context.deltaLons.push(Math.random()*deltaRange - deltaRange/2);
      context.deltaLats.push(Math.random()*deltaRange - deltaRange/2);

      return context.data;
  };

  return {
      tick,
  };
};

const data = initializeData();
setInterval(() => {
    io.emit('tracks', data.tick());
}, 33);