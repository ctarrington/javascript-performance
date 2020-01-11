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
  const theData = [{id: 1, lon: -80, lat: 25}];

  const tick = () => {

      theData[0].lat += 0.01;
      return theData;
  }

  return {
      tick,
  };
};

const data = initializeData();
setInterval(() => {
    io.emit('tracks', data.tick());
}, 1000);