// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
// Routes
import roomRoutes from './routes/room.routes.ts';
import usersRoutes from './routes/user.routes.ts'
import bookingsRoutes from './routes/booking.routes.ts'
import getRoleRoutes from './routes/getRole.routes.ts'
import logoutRoutes from './routes/logout.routes.ts'

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
app.use('/api/user-role', getRoleRoutes)
app.use('/api/logout', logoutRoutes)

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/coworkify';
mongoose.connect(mongoUri)
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })

app.listen(8080, () => {
    console.log('server listening on port 8080')
})