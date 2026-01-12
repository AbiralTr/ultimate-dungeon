import express from "express";
import { engine } from "express-handlebars";
import path from "path";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRouter from "./routes/auth.js";
import { requirePageUser } from "./middleware/requirePageUser.js";
import { WebSocketServer } from 'ws';
import { createServer } from 'http'; 

dotenv.config();

const app = express();
const server = createServer(app)
const PORT = process.env.PORT || 3000;

app.engine("hbs", engine({ extname: ".hbs" }));
app.set("view engine", "hbs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static("public"));
app.use(express.json()); 
app.use(cookieParser()); 
app.use("/api/auth", authRouter);
app.use((req, res, next) => {
  res.locals.isAuthPage =
    req.path === "/login" || req.path === "/register";
  next();
});

app.get("/home", requirePageUser, (req, res) => {res.render("home")});
app.get("/login", (req, res) => {res.render("login")});
app.get("/register", (req, res) => {res.render("register")});
app.get('/websocket-test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>Express WebSocket Demo</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    #messages { border: 1px solid #ccc; height: 300px; 
                               overflow-y: scroll; padding: 10px; margin-bottom: 10px; }
                    #messageInput { width: 300px; padding: 5px; }
                    button { padding: 5px 10px; }
                </style>
            </head>
            <body>
                <h1>Express WebSocket Demo</h1>
                <div id="messages"></div>
                <input type="text" id="messageInput" placeholder="Enter your message">
                <button onclick="sendMessage()">Send Message</button>
                <script>
                    const ws = new WebSocket('ws://localhost:3000');
                    const messages = document.getElementById('messages');

                    ws.onmessage = function(event) {
                        const messageDiv = document.createElement('div');
                        messageDiv.textContent = event.data;
                        messages.appendChild(messageDiv);
                        messages.scrollTop = messages.scrollHeight;
                    };

                    function sendMessage() {
                        const input = document.getElementById('messageInput');
                        if (input.value) {
                            ws.send(input.value);
                            input.value = '';
                        }
                    }

                    document.getElementById('messageInput').addEventListener('keypress', function(e) {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    });
                </script>
            </body>
        </html>
    `);
});

class ConnectionManager {
    constructor() {
        this.clients = new Set();
    }

    addClient(ws) {
        this.clients.add(ws);
        console.log(`Client added. Total clients: ${this.clients.size}`);
    }

    removeClient(ws) {
        this.clients.delete(ws);
        console.log(`Client removed. Total clients: ${this.clients.size}`);
    }

    broadcast(message, sender = null) {
        this.clients.forEach(client => {
            if (client.readyState === client.OPEN) {
                try {
                    client.send(message);
                } catch (error) {
                    console.error('Error broadcasting to client:', error);
                    this.removeClient(client);
                }
            }
        });
    }

    getClientCount() {
        return this.clients.size;
    }
}

const connectionManager = new ConnectionManager();

const wss = new WebSocketServer({ 
    server,
    clientTracking: true
});

wss.on("connection", function connection(ws, request) {
    const clientIP = request.socket.remoteAddress;
    console.log(`New client connected from ${clientIP}`);

    // Send welcome message
    ws.send('Welcome to the WebSocket server!');

    connectionManager.addClient(ws);
    ws.send(`Welcome! There are ${connectionManager.getClientCount()} clients connected.`);

    // Notify other clients about new connection
    connectionManager.broadcast(`A new user joined the chat!`, ws);

    ws.on("message", function message(data) {
        try {
            const messageText = data.toString();
            console.log("Received:", messageText);

            // Broadcast message to all other clients
            connectionManager.broadcast(`User says: ${messageText}`, ws);
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on("close", function close(code, reason) {
        connectionManager.removeClient(ws);
        connectionManager.broadcast(`A user left the chat.`);
        console.log(`Client disconnected - Code: ${code}, Reason: ${reason}`);
    });

});

server.listen(PORT , () => {
  console.log(`Ultimate Dungeon is Listening on port ${PORT}`);
}); 