import Room from '../models/room.model.ts';
import Booking from '../models/booking.model.ts';
import User from '../models/user.model.ts';
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
        
        const userObject = await User.findOne({username: name})
        if (userObject?.roleRaise === false) {
            console.log("The user has not been confirmed")
            res.status(403).send()
            return
        }

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
        console.log(`Getting the rooms: \n${rooms}`)
        res.status(200).json(rooms);
    } catch(error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'An error occurred while fetching rooms.' });
    }
}

export const removeRoom = async(req: Request, res: Response) : Promise<void> => {
    try {
        const { id } = req.params;
        const deletedBookings = await Booking.deleteMany({roomId: id});
        console.log(`Succesfully deleted the following bookings: \n${deletedBookings}`)
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

export const updateRoom = async(req: Request, res: Response) : Promise<void> => {
    try {
        const {id} = req.params;
        const {
            address,
            name,
            roomNumber,
            roomOpens,
            roomCloses,
            capacity,
            type,
        } = req.body;

        const userObject = await User.findOne({username: name})
        if (userObject?.roleRaise === false) {
            console.log("The user has not been confirmed")
            res.status(403).send()
            return
        }
        
        console.log(`This was the ID: ${id} \n\n This was the Payload: \n ${address}\n${name}\n${roomNumber}\n${roomOpens}\n${roomCloses}\n${capacity}\n${type}\n`);
        
        const updatedRoom = await Room.findByIdAndUpdate(
            id,
            { address, name, roomNumber, roomOpens, roomCloses, capacity, type },
            { new: true, runValidators: true }
        );
      
        if (!updatedRoom) {
            res.status(404).json({ message: 'Room not found' });
            return;
        }

        res.status(204).send()
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Update Error'})
    }
}