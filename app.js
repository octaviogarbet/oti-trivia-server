const express = require('express')
const cors = require('cors');
const http = require("http")
const app = express()
const port = 3000
const sessions = []
const WebSocket = require("ws")

//initialize a simple http server
const server = http.createServer(app);

app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/game/:id', (req, res) => {
  if (sessions.length > +req.params.id)
    res.send(sessions[+req.params.id])
  else
    res.send({})
})

app.post('/join/:id', (req, res) => {
  if (sessions.length > +req.params.id){
    res.send(sessions[+req.params.id])
  } else {
    res.send({})
  }
})

app.put('/game/:id/reset', (req, res) => {
  if (sessions.length > +req.params.id){
    sessions[+req.params.id].answerOrder = []
    sessions[+req.params.id].banned = []
    sessions[+req.params.id].answering = null
    sessions[+req.params.id].answeringPosition = 0
    sessions[+req.params.id].canAnswer = false
    res.send({})
  } else {
    res.send({})
  }
})

app.put('/game/:id/start', (req, res) => {
  if (sessions.length > +req.params.id){
    sessions[+req.params.id].canAnswer = true
    res.send({})
  } else {
    res.send({})
  }
})

app.put('/game/:id/wrong', (req, res) => {
  if (sessions.length > +req.params.id){
    if (sessions[+req.params.id].answerOrder.length === (sessions[+req.params.id].answeringPosition - 1)) {
      sessions[+req.params.id].answeringPosition = 0;
    } else {
      sessions[+req.params.id].answeringPosition++;
    }
    sessions[+req.params.id].answering = sessions[+req.params.id].answerOrder[sessions[+req.params.id].answeringPosition];
    res.send({})
  } else {
    res.send({})
  }
})

app.put('/game/:id/correct', (req, res) => {
  if (sessions.length > +req.params.id){
    sessions[+req.params.id].answering

    sessions[+req.params.id].nextQuestion
    pointsTable
    scoreBoard
    nextQuestion.category
    nextQuestion.points
    res.send({})
  } else {
    res.send({})
  }
})

app.put('/game/:id/skip', (req, res) => {
  if (sessions.length > +req.params.id){
    sessions[+req.params.id].answering

    sessions[+req.params.id].nextQuestion
    pointsTable
    scoreBoard
    nextQuestion.category
    nextQuestion.points
    res.send({})
  } else {
    res.send({})
  }
})

app.put('/game/:id/answer', (req, res) => {
  const { body } = req;
  if (sessions.length > +req.params.id) {
    sessions[+req.params.id].nextQuestion = { category: body.category, points: 25}
    res.send({})
  } else {
    res.send({})
  }
})

app.post('/game', (req, res) => {
  const { body } = req;
  const points = [];
  for (let index = 1; index <= body.totalQuestions; index++) {
    points.push(25 * index);
  }
  
  const newSession = {
    id: sessions.length,
    players: [],
    name: body.name,
    canAnswer: false,
    totalQuestions: body.totalQuestions,
    totalCategories: body.totalCategories,
    categories: body.categories,
    answering: null,
    answeringPosition: 0,
    nextQuestion: null,
    answerOrder: [],
    banned: [],
    scoreBoard: [],
    pointsTable: body.categories.map(category => ({category, questions: points.map(p => ({points: p, answered: false}))}))
  };
  sessions.push(newSession);
  console.log(req.body);

  res.send(newSession)
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
