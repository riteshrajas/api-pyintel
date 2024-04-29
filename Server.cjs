const {WebSocketServer} = require("ws");
const server  = new WebSocketServer({port :1234});

server.on("connection" ,(socket)=> {
    socket.on("message", (data) => {
        console.log('Received from client:'+ data);
        socket.send('Hello from server');
    })
})