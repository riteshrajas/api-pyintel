const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { WebSocket, WebSocketServer } = require('ws');
const api = require('./api.cjs');
const iot = require('./iot.cjs');

const server = http.createServer((req, res) => {
  const reqUrl = url.parse(req.url, true);
  let route = reqUrl.pathname;

  // Serve static files from the 'public' directory
  const staticFilePath = path.join(__dirname, 'assets', route);
  fs.readFile(staticFilePath, (err, data) => {
    if (!err) {
      const ext = path.extname(staticFilePath).toLowerCase();
      const mimeTypes = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
      return;
    }

    // Handle specific routes
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
    }
    else if (route.startsWith('/iot')) {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
    }
    else if (route.startsWith('/project')) {
      fs.readFile(path.join(__dirname, 'project.html'), (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
    else if (route.startsWith('/ScoutOps')) {
      route = '/ScoutOps.html';
      fs.readFile(path.join(__dirname, route), (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Server error');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    }
    else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Page not found');
    }
  });
});

const port = 3000;
const host = '127.0.0.1';
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
  console.log(`API running at http://${host}:${port}/api?text=hello`);
  console.log(`IoT API running at http://${host}:${port}/iot`);
});

const IotServer = new WebSocketServer({ port: 1234 });

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