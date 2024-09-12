const http = require("http");

const { WebSocketServer, createWebSocketStream } = require("ws");
const { readFileSync } = require("fs");

const html = readFileSync("index.min.html")

const server = http.createServer((_, res) => {
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.end(html);
});

const wss = new WebSocketServer({
    server,
    path: "/connect"
})

const MAX_ROOMS = process.env.MAX_ROOMS ?? 20;

const ERROR_MAX_ROOMS = 4001;
const ERROR_NO_ROOM = 4002;
const ERROR_HOST_DISCONNECTED = 4003;
const ERROR_PLAYER_DISCONNECTED = 4004;

/**
 * @type {Map<string, WebSocket>}
 */
const rooms = new Map();

const createRoomCode = () => {
    let code;
    do {
        code = 10000 + Math.round(Math.random() * 9999);
    } while(rooms.has(code));

    return code.toString().slice(1);
}

wss.on('connection', (socket, request) => {
    if(!request.url) {
        socket.close()
        return;
    }

    const url = new URL(request.url, "http://smth.com");

    const code = url.searchParams.get("code");

    if(!code) {
        if(rooms.size === MAX_ROOMS) {
            socket.close(ERROR_MAX_ROOMS);
            return;
        }

        const newRoom = createRoomCode();

        rooms.set(newRoom, socket);

        socket.onclose = () => {
            rooms.delete(newRoom);
        }

        socket.send(JSON.stringify({ code: newRoom }));

        return;
    }

    const hostSocket = rooms.get(code);

    if(!hostSocket) {
        socket.close(ERROR_NO_ROOM)
        return;
    }

    const hostStream = createWebSocketStream(hostSocket);
    const playerStream = createWebSocketStream(socket);

    hostStream.pipe(playerStream);
    playerStream.pipe(hostStream);

    hostSocket.onclose = () => {
        socket.close(ERROR_HOST_DISCONNECTED);
        hostStream.destroy();
        playerStream.destroy();

        rooms.delete(code);
    }

    socket.onclose = () => {
        socket.close(ERROR_PLAYER_DISCONNECTED);
        hostStream.destroy();
        playerStream.destroy();

        rooms.delete(code);
    }

    socket.send("ESTABLISHED");
})

server.listen(process.env.PORT ?? "8080", process.env.HOST ?? "0.0.0.0", () => {
    console.log(`Started on port ${process.env.PORT ?? "8080"}`);
})