// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { Socket } from 'socket.io';
import { createClient } from 'redis';
// Routes
import roomRoutes from './routes/room.routes.ts';
import usersRoutes from './routes/user.routes.ts';
import bookingsRoutes from './routes/booking.routes.ts';
import adminRoutes from './routes/admin.routes.ts';

const app = express()
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173" // CLIENT_URL är en Enviorment variabel som finns i herkou.
app.use(cors({
    origin: [ CLIENT_URL ],
    credentials: true
}));
app.options("*", cors({ origin: [CLIENT_URL], credentials: true })); // På alla options request så är dom okej om deras cross-origin är från vår client och har credentials.

app.use(express.json())
app.use(cookieParser()) // Gör så att vi kan köra req.cookies
app.use('/api/room', roomRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/admin', adminRoutes)


const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworkify';
const PORT = process.env.PORT || 8080; // PORT är en inbyggd Enviorment variabel i heroku so tar en leddig port.
mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })

const httpServer = createServer(app); // Gör så att vi kan köra både HTTP request via express routes och lägga till vår websocket

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});


const rawUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const useTls = rawUrl.startsWith('rediss://');

const client = createClient({
  url: rawUrl,
  socket: {
    tls: useTls,              
    rejectUnauthorized: false 
  },
});

client.on('error', err => console.log('Redis Client Error', err));
client.connect()
  .then(() => console.log('Redis client connected'))
  .catch((err) => console.error('Redis connection error', err));
  
io.on('connection', (socket: Socket) => {
    
    socket.join('joinedRoom')
    
    socket.on('roomIDJoin', (userId: string) => {
        socket.join(userId);
        console.log(`User socket joined room: ${userId}`);        

        setTimeout(() => {
            const rooms = io.sockets.adapter.rooms;
            console.log("All active rooms:", [...rooms.entries()]
                .filter(([key]) => !key.includes(socket.id))
                .map(([key, set]) => `${key}: ${set.size} connections`));
        }, 1000);
        
        socket.emit('roomIDJoinAck', userId);
    });

    socket.on('testEvent', () => {
        console.log('Succesfully tested.')
    })

    console.log("Client joined rooms:", Array.from(socket.rooms));
});

app.set('redisclient', client)
app.set('socketio', io);

httpServer.listen(PORT, () => {
    console.log('Server listening on port 8080');
});