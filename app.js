const express = require('express')
const cors = require('cors');
const http = require("http")
const app = express()
const port = 3000
const sessions = []
const WebSocket = require("ws")
const queryString = require("query-string");

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
  try {
    if (sessions.length > +req.params.id)
      res.send(sessions[+req.params.id])
    else
      res.send({})
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.post('/join/:id', (req, res) => {
  try {
    if (sessions.length > +req.params.id){
      const { body } = req;
      const game = sessions[+req.params.id];
      if (game.players.indexOf(body.player) === -1) {
        game.players.push(body.player)
        game.scoreBoard.push({name: body.player, points: 0})
      }
      res.send(sessions[+req.params.id])
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/reset', (req, res) => {
  try {
    if (sessions.length > +req.params.id){
      sessions[+req.params.id].answerOrder = []
      sessions[+req.params.id].banned = []
      sessions[+req.params.id].answering = null
      sessions[+req.params.id].answeringPosition = 0
      sessions[+req.params.id].canAnswer = false
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/start', (req, res) => {
  try {
    if (sessions.length > +req.params.id){
      sessions[+req.params.id].canAnswer = true
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/wrong', (req, res) => {
  try {
    if (sessions.length > +req.params.id) {
      const currentParticipantIndex = sessions[+req.params.id].scoreBoard.findIndex(p => p.name === sessions[+req.params.id].answering);
      sessions[+req.params.id].scoreBoard[currentParticipantIndex].points = sessions[+req.params.id].scoreBoard[currentParticipantIndex].points - (sessions[+req.params.id].nextQuestion.points / 3);
      if (sessions[+req.params.id].answerOrder.length === (sessions[+req.params.id].answeringPosition - 1)) {
        sessions[+req.params.id].answeringPosition = 0;
      } else {
        sessions[+req.params.id].answeringPosition++;
      }
      sessions[+req.params.id].answering = sessions[+req.params.id].answerOrder[sessions[+req.params.id].answeringPosition];
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/correct', (req, res) => {
  try {
    if (sessions.length > +req.params.id){
      const currentParticipantIndex = sessions[+req.params.id].scoreBoard.findIndex(p => p.name === sessions[+req.params.id].answering);
      sessions[+req.params.id].scoreBoard[currentParticipantIndex].points = sessions[+req.params.id].scoreBoard[currentParticipantIndex].points + sessions[+req.params.id].nextQuestion.points;
      sessions[+req.params.id].answering = null
      sessions[+req.params.id].answeringPosition = 0
      sessions[+req.params.id].answerOrder = []
      sessions[+req.params.id].canAnswer = false
      const columnPosition = sessions[+req.params.id].pointsTable.findIndex(c => c.category === sessions[+req.params.id].nextQuestion.category);
      const squareIndex = sessions[+req.params.id].pointsTable[columnPosition].questions.findIndex(c => c.points === sessions[+req.params.id].nextQuestion.points);
      sessions[+req.params.id].pointsTable[columnPosition].questions[squareIndex].answered = true;
      sessions[+req.params.id].answering = [];
      sessions[+req.params.id].banned = [];
      sessions[+req.params.id].nextQuestion = null
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/skip', (req, res) => {
  try {
    if (sessions.length > +req.params.id){
      sessions[+req.params.id].answering = null
      sessions[+req.params.id].answeringPosition = 0
      sessions[+req.params.id].answerOrder = []
      sessions[+req.params.id].canAnswer = false
      const column = sessions[+req.params.id].pointsTable.find(c => c.category === sessions[+req.params.id].nextQuestion.category);
      const square = column.questions.find(c => c.points === sessions[+req.params.id].nextQuestion.points);
      square.answered = true;
      sessions[+req.params.id].answering = [];
      sessions[+req.params.id].banned = [];
      sessions[+req.params.id].nextQuestion = null
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.put('/game/:id/answer', (req, res) => {
  try {
    const { body } = req;
    if (sessions.length > +req.params.id) {
      const column = sessions[+req.params.id].pointsTable.find(c => c.category === body.category);
      const square = column.questions.find(c => c.answered === false);
      sessions[+req.params.id].nextQuestion = { category: body.category, points: square.points};
      wss.clients.forEach(client => {
        if (client.session.uid == req.params.id) {
          client.send(JSON.stringify({ type: 'update', body: sessions[+req.params.id] }));
        }    
      });
      res.send({})
    } else {
      res.send({})
    }
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

app.post('/game', (req, res) => {
  try {
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

    res.send(newSession)
  } catch (error) {
    console.log(error)
    res.send({})
  }
})

//app.listen..
server.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

//initialize the WebSocket server instance
const wss = new WebSocket.Server({ server, path: '/websocket' });

wss.on('connection', (ws, req) => {
  try {
    const [_path, params] = req?.url?.split("?");
    const connectionParams = queryString.parse(params);
    // const parameters = url.parse(req.url, true);
    //console.log(req);
    console.log(connectionParams);
    ws.uid = getUniqueID();
    ws.session = {uid: connectionParams.gameId};
    if (connectionParams.player) {
      ws.client = connectionParams.player;
    }

    //connection is up, let's add a simple simple event
    ws.on('message', (message) => {
      const body = JSON.parse(message)
      if (body) {
        // handle push messages
        if (body.type === 'push') {
          console.log(ws.client)
          const game = sessions[+ws.session.uid]
          console.log(game)
          if (sessions[+ws.session.uid].canAnswer) {
            if (sessions[+ws.session.uid].answerOrder.length) {
              if (sessions[+ws.session.uid].answerOrder.indexOf(ws.client) === -1 && sessions[+ws.session.uid].banned.indexOf(ws.client) === -1) {
                sessions[+ws.session.uid].answerOrder.push(ws.client)
              }
            } else {
              sessions[+ws.session.uid].answerOrder.push(ws.client)
              sessions[+ws.session.uid].answering = ws.client;
              sessions[+ws.session.uid].answeringPosition = 0;
            }
          } else {
            if (sessions[+ws.session.uid].banned.indexOf(ws.client) === -1) {
              sessions[+ws.session.uid].banned.push(ws.client)
            }
          }
        }

        wss.clients.forEach(client => {
          if (client.session.uid == ws.session.uid) {
            client.send(JSON.stringify({ type: 'update', body: sessions[+ws.session.uid] }));
          }    
        });
      }
    });

    wss.clients.forEach(client => {
      if (client != ws && client.session.uid == ws.session.uid) {
        client.send(JSON.stringify({ type: 'update', body: sessions[+connectionParams.gameId] }));
      }    
    });
  } catch (error) {
    console.log(error)
  }
});
