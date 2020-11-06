const express = require('express');
const os = require('os');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {});
const path = require('path');

var IPv4,hostName;
// hostName=os.hostname();
// for(var i=0;i<os.networkInterfaces().en0.length;i++){
//     if(os.networkInterfaces().en0[i].family=='IPv4'){
//         IPv4=os.networkInterfaces().en0[i].address;
//     }
// }
IPv4 = getIPAdress();
// hostName = server.address().port;
console.log('----------local IP: '+IPv4);
console.log('----------local host: '+hostName);
function getIPAdress() {
    var interfaces = require('os').networkInterfaces();　　
    for (var devName in interfaces) {　　　　
        var iface = interfaces[devName];　　　　　　
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }　　
    }
}
io.on('connection', socket => { 
        console.log('webpage socket io connected');
    });
io.on('disconnected', socket => {
    console.log('webpage socket io disconnected');
});

app.use(express.static('dist'));
app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
app.get('/api/ip', (req, res) => {
    res.send({
        ip: IPv4
    });
});
app.get('/*', function (req, res) {
    console.log(__dirname);
    console.log(path.join(__dirname, '/../../dist', 'index.html'));
    res.sendFile(path.join(__dirname, '/../../dist', 'index.html'));
});




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



