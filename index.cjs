const http = require('http');
const url = require('url');
const fs = require('fs');
const { WebSocket, WebSocketServer } = require('ws');
const path = require('path');
const api = require('./api.cjs');
const iot = require('./iot.cjs');



const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  const route = reqUrl.pathname;


  if (route === '/') {
    fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  } else if (route.startsWith('/api')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(api.processQuery(res, reqUrl.query));
  } else if (route.startsWith('/iot')){
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res
  } else {
    // Try to serve static files
    const staticFilePath = path.join(__dirname, route);
    fs.readFile(staticFilePath, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Page not found');
      } else {
        res.writeHead(200);
        res.end(data);
      }
    });
  }
});
const port = 3000;
const host = '127.0.0.1';
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
  console.log(`API running at http://${host}:${port}/api?text=hello`);
  console.log(`IoT API running at http://${host}:${port}/iot`);
});


const IotServer = new WebSocketServer({port: 1234});



let clients = new Set();


IotServer.on('connection', (ws) => {
  clients.add(ws);
  console.log('New client connected');

  ws.on('message', (data) => {
    console.log('Received from IoT device: ' + data);
    // Broadcast to all clients
    for (let client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Hello from server');
      }
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('Error occurred:', err);
  });
});

// Heartbeat
setInterval(() => {
  IotServer.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.ping();
    }
  });
}, 5000);
