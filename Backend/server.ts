// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
// Routes
import roomRoutes from './routes/room.routes.ts';
import usersRoutes from './routes/user.routes.ts'
import bookingsRoutes from './routes/user.routes.ts'

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/room', roomRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)

mongoose.connect('mongodb://localhost:27017/coworkify')
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })


app.listen(8080, () => {
    console.log('server listening on port 8080')
})