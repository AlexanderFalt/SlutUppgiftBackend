// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
// Routes
import roomRoutes from './routes/room.routes.ts';
import usersRoutes from './routes/user.routes.ts'
import bookingsRoutes from './routes/user.routes.ts'
import getRoleRoutes from './routes/getRole.routes.ts'

const app = express()
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api/room', roomRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/user-role', getRoleRoutes)


mongoose.connect('mongodb://localhost:27017/coworkify')
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })


app.listen(8080, () => {
    console.log('server listening on port 8080')
})