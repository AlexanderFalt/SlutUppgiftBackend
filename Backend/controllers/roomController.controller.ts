import Room from '../models/roomsSchema.model.ts';
import { Request, Response } from 'express';

export const createRoom = async(req: Request, res: Response) : Promise<void> => {
    try{
        const {
            address, 
            name, 
            roomNumber, 
            roomOpens, 
            roomCloses, 
            capacity, 
            type
        } = req.body;
        
        const newRoom = new Room({
            address,
            name,
            roomNumber,
            roomOpens,
            roomCloses,
            capacity,
            type,
        })

        await newRoom.save()

        res.status(201).json(newRoom)
    } catch(error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' })
    }
}

export const getRooms = async(req: Request, res: Response) :  Promise<void> => {
    try {
        const rooms = await Room.find({}).lean();
        res.status(200).json(rooms);
    } catch(error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'An error occurred while fetching rooms.' });
    }
}

export const removeRoom = async(req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.params;
        const room = await Room.findByIdAndDelete(id);
        if (!room) {
          res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json({ message: 'Room deleted successfully' });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Deletion Error'})
    }
}