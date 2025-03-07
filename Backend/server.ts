// Packages
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
// Routes
import roomRoutes from './routes/roomRoutes.routes.ts';

const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/room', roomRoutes)

mongoose.connect('mongodb://localhost:27017/coworkify')
    .then(() => {
        console.log('Connected to database')
    }).catch((error) => {
        console.log(error)
    })


app.listen(8080, () => {
    console.log('server listening on port 8080')
})