const fs = require('fs');
const ws = require('ws');
const http = require('http');
const url = require('url');

const wsServer = new ws.Server({noServer: true});

const httpServer = http.createServer((request, response) => {
  fs.readFile('index.html', (error, contents) => {
    if (error) {
      response.writeHead(500);
      response.end(`error ${JSON.stringify(error)}`);
      response.end();
    }
    else {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.end(contents, 'utf-8');
    }
  });
});

httpServer.on('upgrade', (request, socket, head) => {
  const pathname = url.parse(request.url).pathname;

  if (pathname === '/ws') {
    wsServer.handleUpgrade(request, socket, head, ws => {
      wsServer.emit('connection', ws, request);
    });
  }
});

function gameLogic(message) {
  switch (message.type) {
    case 'welcome':
      console.log('Welcome message:', message.message);
      break;
  }
}

const gamePackage = {
  state: {},
  logic: gameLogic.toString()
};

wsServer.on('connection', socket => {
  console.log('new ws connection');

  sendTo(socket, JSON.stringify(gamePackage));
  sendTo(socket, JSON.stringify({'type': 'welcome', 'message': 'hi'}));

  socket.on('message', message => {
    console.log('ws msg', message);
  });
});

function sendTo (socket, message) {
  if (socket.readyState === ws.OPEN) socket.send(message);
}

httpServer.listen(process.env.http_port || 8182);


