const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');



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
  } else if (route.startsWith('/api/')) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('API Interface');
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
});