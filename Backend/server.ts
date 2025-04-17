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
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json())
app.use(cookieParser())
app.use('/api/room', roomRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/admin', adminRoutes)

const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL must be set');
  }
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coworkify';
const PORT = process.env.PORT || 8080;
mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })

const httpServer = createServer(app); // Gör så att vi kan köra både HTTP request via express routes och lägga till vår websocket

const io = new SocketIOServer(httpServer, {
    cors: {
        origin: 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const isTls = redisUrl.startsWith('rediss://');

const client = createClient({
  url: redisUrl,
  socket: isTls
    ? { tls: true, rejectUnauthorized: false }
    : undefined,
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