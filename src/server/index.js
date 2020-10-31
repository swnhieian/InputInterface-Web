const express = require('express');
const os = require('os');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {});

io.on('connection', socket => { 
        console.log('socket io connected');
    });
io.on('disconnected', socket => {
    console.log('socket io disconnected');
});

app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

server.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));


//socket 

const net = require('net');
const socketServer = net.createServer((connection) => {
    console.log(`客户端 ${connection.remoteAddress} 已连接`);
    connection.on('end', () => {
        console.log(`客户端 ${connection.remoteAddress}已断开连接`);
    });
    connection.on('data', bytes => {
        str = bytes.toString();
        console.log(str);
        io.sockets.emit('data', str);
    });
    connection.on('error', err => {
        console.log('发送客户端错误' + err);
    });
    connection.on('close', had_err => {
        console.log('发送客户端关闭,' + (had_err?'有':'无')+'错误');
    });
    // connection.pipe(connection);
});
socketServer.listen(8081, () => {
     console.log('socket服务器已启动');
    });


