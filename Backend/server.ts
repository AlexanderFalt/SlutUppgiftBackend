// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { logger } from './utils/logger.utils.ts';
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

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/coworkify';
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
        credentials: true
    }
});

io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    console.log("CONNECTING NEW CLIENT: ", socket.id)
    socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
        console.log("DISCONNECTING CLIENT: ", socket.id)
    });
});


app.set('socketio', io);

httpServer.listen(8080, () => {
    console.log('Server listening on port 8080');
});