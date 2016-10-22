var express = require('express');
var path = require('path');

var data = express();
var output = express();

// Run server to listen on port 3000.
const dataServer = data.listen(3000, () => {
  console.log('listening on *:3000');
});

// Run server to listen on port 3000.
const outputServer = output.listen(3001, () => {
  console.log('listening on *:3001');
});

const io = require('socket.io')(outputServer);

var dataPort = 3000;
var publicPort = 3001;
var host = 'mc.easymodegaming.com';

var body = '';
var response = '';
var jsonData = '';

data.use(function(req,res){
  if (req.method == 'POST') {
      console.log("Handling POST request...");
      res.writeHead(200, {'Content-Type': 'text/html'});

      req.on('data', function (data) {
          body += data;
          response = data;
          try {
            jsonData = JSON.parse(data);

            console.log("Name: "+ jsonData.player.name +  ", Health: " + jsonData.player.state.health);

            io.emit('chat message',
            "<h2>Game Info</h2>"
            + "<p><b>Map:</b> "+ jsonData.map.name
            + "<p><b>Mode:</b> "+ jsonData.map.mode
            + "<p><b>Score:</b> CT "+ jsonData.map.team_ct.score + "-" + jsonData.map.team_t.score+ " T"
            + "<h2>Player Info</h2>"
            + "<p><b>Name:</b> "+ jsonData.player.name
            + "<br><b>Health:</b> " + jsonData.player.state.health
            + "<br><b>Armor:</b> " + jsonData.player.state.armor
            + "<br><b>Money:</b> " + jsonData.player.state.money
            + "<br><b>Kills:</b> " + jsonData.player.match_stats.kills
            + "<br><b>Assists:</b> " + jsonData.player.match_stats.assists
            + "<br><b>Deaths:</b> " + jsonData.player.match_stats.deaths

            + "</p>"
          );

          io.emit('health', jsonData.player.state.health);

          }
          catch(err){
            console.log("Json Parse Error" + data);
            io.emit('chat message', "No Data");
          }


      });
      req.on('end', function () {
          //console.log("POST payload: " + body);
        res.end( '' );
      });
  }
  else
  {
      console.log("Not expecting other request types...");
      res.writeHead(200, {'Content-Type': 'text/html'});
  var html = '<html><body>HTTP Server at http://' + host + ':' + dataPort + '</body></html>';
      res.end(html);
  }
});

output.get('/',function(req,res){
  res.sendFile(path.join(__dirname+'/index2.html'));
});

// Set socket.io listeners.
io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});
