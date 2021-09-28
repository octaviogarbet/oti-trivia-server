const express = require('express')
const http = require("http")
const app = express()
const port = 3000
const sessions = []
const WebSocket = require("ws")

//initialize a simple http server
const server = http.createServer(app);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/', (req, res) => {
  res.send('Hello World!')
})

//app.listen..
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server, path: 'websocket' });

wss.on('connection', (ws) => {

  const parameters = url.parse(req.url, true);

  ws.uid = wss.getUniqueID();
  ws.session = {uid: parameters.query.session};
  ws.client = parameters.query.name;

  //connection is up, let's add a simple simple event
  ws.on('message', (message) => {
    JSON.parse(message)

      //log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);

      wss.clients.forEach(client => {
        if (client != ws) {
          client.send(`Hello, broadcast message -> ${message}`);
        }    
      });
  });

  //send immediatly a feedback to the incoming connection    
  ws.send('Hi there, I am a WebSocket server');
});
